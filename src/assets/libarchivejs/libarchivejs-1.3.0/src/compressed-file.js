
/**
 * Represents compressed file before extraction
 */
export class CompressedFile{

    constructor(name,size,path,archiveRef){
        this._name = name;
        this._size = size;
        this._path = path;
        this._archiveRef = archiveRef;
    }

    /**
     * file name
     */
    get name(){
        return this._name;
    }
    /**
     * file size
     */
    get size(){
        return this._size;
    }

    /**
     * Extract file from archive
     * @returns {Promise<File>} extracted file
     */
    extract(){
        return this._archiveRef.extractSingleFile(this._path);
    }

}