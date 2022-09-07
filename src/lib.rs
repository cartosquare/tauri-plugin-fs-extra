// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use serde::{ser::Serializer, Serialize};
use tauri::{command, plugin::Plugin, Invoke, Runtime};
use std::fs;
use std::{
  path::Path,
  path::PathBuf,
  time::{SystemTime, UNIX_EPOCH},
};

type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),
}

impl Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Metadata {
  accessed_at_ms: u64,
  created_at_ms: u64,
  modified_at_ms: u64,
  is_dir: bool,
  is_file: bool,
  is_symlink: bool,
  size: u64,
  // parent: PathBuf,
  // name: String,
  // extension: String,
  path: PathBuf,
  has_child: bool,
  id: String,
}

fn system_time_to_ms(time: std::io::Result<SystemTime>) -> u64 {
  time
    .map(|t| {
      let duration_since_epoch = t.duration_since(UNIX_EPOCH).unwrap();
      duration_since_epoch.as_millis() as u64
    })
    .unwrap_or_default()
}

#[command]
async fn metadata(file_path: PathBuf, file_id: String) -> Result<Metadata> {
  // let rs_path = Path::new(&file_path);
  let metadata = std::fs::metadata(&file_path)?;
  let file_type = metadata.file_type();
  Ok(Metadata {
    accessed_at_ms: system_time_to_ms(metadata.accessed()),
    created_at_ms: system_time_to_ms(metadata.created()),
    modified_at_ms: system_time_to_ms(metadata.modified()),
    is_dir: file_type.is_dir(),
    is_file: file_type.is_file(),
    is_symlink: file_type.is_symlink(),
    // parent: file_path.parent().unwrap().to_path_buf(),
    // name: file_path.file_name().unwrap().to_str().unwrap().to_owned(),
    // extension: file_path.extension().unwrap().to_str().unwrap().to_owned(),
    path: file_path.clone(),
    has_child: if file_type.is_dir() { !file_path.read_dir()?.next().is_none() } else { false },
    size: metadata.len(),
    id: file_id,
  })
}

#[command]
async fn list_metadatas(root_path: String, root_id: String) -> Result<Vec<Metadata>> {
  let paths = fs::read_dir(root_path)?;

  let mut result: Vec<Metadata> = Vec::new();
  let mut cnt = 0;
  for path in paths {
    result.push(metadata(path.unwrap().path(),  format!("{}-{}", root_id, cnt.to_string())).await?);
    cnt += 1;
  }
  Ok(result)
}

#[command]
async fn exists(path: PathBuf) -> bool {
  path.exists()
}

/// Tauri plugin.
pub struct FsExtra<R: Runtime> {
  invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> Default for FsExtra<R> {
  fn default() -> Self {
    Self {
      invoke_handler: Box::new(tauri::generate_handler![exists, metadata, list_metadatas]),
    }
  }
}

impl<R: Runtime> Plugin<R> for FsExtra<R> {
  fn name(&self) -> &'static str {
    "fs-extra"
  }

  fn extend_api(&mut self, message: Invoke<R>) {
    (self.invoke_handler)(message)
  }
}
