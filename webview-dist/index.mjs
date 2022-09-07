import { invoke } from '@tauri-apps/api/tauri';

// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
const Extensions = {
    txt: /(txt|csv)/,
    img: /(png|jpeg|jpg|tiff|tif|vrt)/,
    vec: /(shp|geojson)/,
};
function filetype(extension) {
    const ext = extension.toLowerCase();
    if (ext === 'tiff' || ext === 'tif') {
        return 'img';
    }
    else if (ext === 'shp') {
        return 'vec';
    }
    else {
        return '';
    }
}
function MetadataMap(metadata) {
    let filePath = metadata.path;
    if (metadata.path.lastIndexOf('/') === metadata.path.length - 1 || metadata.path.lastIndexOf('\\') === metadata.path.length - 1) {
        filePath = metadata.path.slice(0, -1);
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
async function metadata(filePath, fileId) {
    return await invoke('plugin:fs-extra|metadata', { filePath, fileId }).then((metadata) => {
        return MetadataMap(metadata);
    }).catch((err) => {
        return Promise.reject(err);
    });
}
async function listMetadatas(rootPath, rootId) {
    return await invoke('plugin:fs-extra|list_metadatas', { rootPath, rootId }).then((metadata) => {
        return metadata.map(MetadataMap);
        // let result: Metadata[] = metadata.map(MetadataMap);
        // return result;
        // return Promise.resolve(result);
    }).catch((err) => {
        return Promise.reject(err);
    });
}
async function exists(path) {
    return await invoke('plugin:fs-extra|exists', { path });
}

export { Extensions, exists, filetype, listMetadatas, metadata };
