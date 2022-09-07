// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { invoke } from '@tauri-apps/api/tauri';
/**
 * Metadata information about a file.
 * This structure is returned from the `metadata` function or method
 * and represents known metadata about a file.
 */
export interface Metadata {
    /**
     * The last access time of this metadata.
     */
    accessedAt: Date;
    /**
     * The creation time listed in this metadata.
     */
    createdAt: Date;
    /**
     * The last modification time listed in this metadata.
     */
    modifiedAt: Date;
    /**
     * `true` if this metadata is for a directory.
     */
    isDir: boolean;
    /**
     * `true` if this metadata is for a regular file.
     */
    isFile: boolean;
    /**
     * `true` if this metadata is for a symbolic link.
     */
    isSymlink: boolean;
    /**
     * The size of the file, in bytes, this metadata is for.
     */
    size: number;
    /**
     * The type of the file
     */
    fileType: FileType,
    /**
     * The parent directory of the file.
     */
    parent: string;
    /**
     * The ID of of this file.
     */
    id: string;
    /**
     * The filename
     */
    name: string;
    /**
     * The file extension
     */
    extension: string;
    /**
     * The full path
     */
    path: string,
    /**
     * If is_directory, the directory empty or not
     */
    hasChild: boolean;
}

interface BackendMetadata {
    accessedAtMs: number;
    createdAtMs: number;
    modifiedAtMs: number;
    isDir: boolean;
    isFile: boolean;
    isSymlink: boolean;
    size: number;
    id: string;
    path: string,
    hasChild: boolean;
}

export const Extensions: { [index: string]: RegExp } = {
  txt: /(txt|csv)/,
  img: /(png|jpeg|jpg|tiff|tif|vrt)/,
  vec: /(shp|geojson)/,
};

export type FileType = 'txt' | 'img' | 'vec' | '';

export function filetype(extension: string): FileType {
  const ext = extension.toLowerCase();
  if (ext === 'tiff' || ext === 'tif') {
    return 'img';
  } else if (ext === 'shp') {
    return 'vec';
  } else {
    return '';
  }
}

function MetadataMap(metadata: BackendMetadata): Metadata {
  let filePath = metadata.path;
  if (metadata.path.lastIndexOf('/') === metadata.path.length - 1 || metadata.path.lastIndexOf('\\') === metadata.path.length - 1) {
    filePath = metadata.path.slice(0, -1)
  }
  const parentMatch = filePath.match(/.*[\/\\]/);
  const parent = parentMatch === null ? '' : parentMatch[0];
  const name = filePath.replace(parent, '');
  const extensionOrUndefine = filePath.split('.').pop();
  const extension = extensionOrUndefine === undefined ? '' : extensionOrUndefine;

  const { accessedAtMs, createdAtMs, modifiedAtMs, ...data } = metadata;
  return {
      accessedAt: new Date(accessedAtMs),
      createdAt: new Date(createdAtMs),
      modifiedAt: new Date(modifiedAtMs),
      name: name,
      extension: extension,
      parent: parent,
      fileType: filetype(extension),
      ...data,
  };
}

export async function metadata(filePath: string, fileId: string): Promise<Metadata> {
    return await invoke<BackendMetadata>('plugin:fs-extra|metadata', { filePath, fileId }).then((metadata) => {
        return MetadataMap(metadata);
    }).catch((err) => {
        return Promise.reject(err);
    });
}

export async function listMetadatas(rootPath: string, rootId: string): Promise<Metadata[]> {
  return await invoke<BackendMetadata[]>('plugin:fs-extra|list_metadatas', { rootPath, rootId }).then((metadata) => {
    return metadata.map(MetadataMap);
    // let result: Metadata[] = metadata.map(MetadataMap);
    // return result;
    // return Promise.resolve(result);
  }).catch((err) => {
        return Promise.reject(err);
  });
}

export async function exists(path: string): Promise<boolean> {
    return await invoke('plugin:fs-extra|exists', { path });
}
