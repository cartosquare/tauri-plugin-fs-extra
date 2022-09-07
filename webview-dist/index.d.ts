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
    fileType: FileType;
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
    path: string;
    /**
     * If is_directory, the directory empty or not
     */
    hasChild: boolean;
}
export declare const Extensions: {
    [index: string]: RegExp;
};
export declare type FileType = 'txt' | 'img' | 'vec' | '';
export declare function filetype(extension: string): FileType;
export declare function metadata(filePath: string, fileId: string): Promise<Metadata>;
export declare function listMetadatas(rootPath: string, rootId: string): Promise<Metadata[]>;
export declare function exists(path: string): Promise<boolean>;
