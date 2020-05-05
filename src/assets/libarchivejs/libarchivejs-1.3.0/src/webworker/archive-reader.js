
const TYPE_MAP = {
    32768: 'FILE',
    16384: 'DIR',
    40960: 'SYMBOLIC_LINK',
    49152: 'SOCKET',
    8192:  'CHARACTER_DEVICE',
    24576: 'BLOCK_DEVICE',
    4096:  'NAMED_PIPE',
};

export class ArchiveReader{
    /**
     * archive reader
     * @param {WasmModule} wasmModule emscripten module 
     */
    constructor(wasmModule){
        this._wasmModule = wasmModule;
        this._runCode = wasmModule.runCode;
        this._file = null;
        this._passphrase = null;
    }

    /**
     * open archive, needs to closed manually
     * @param {File} file 
     */
    open(file){
        if( this._file !== null ){
            console.warn('Closing previous file');
            this.close();
        }
        const { promise, resolve, reject } = this._promiseHandles();
        this._file = file;
        const reader = new FileReader();
        reader.onload = () => this._loadFile(reader.result,resolve,reject);
        reader.readAsArrayBuffer(file);
        return promise;
    }

    /**
     * close archive
     */
    close(){
        this._runCode.closeArchive(this._archive);
        this._wasmModule._free(this._filePtr);
        this._file = null;
        this._filePtr = null;
        this._archive = null;
    }

    /**
     * detect if archive has encrypted data
     * @returns {boolean|null} null if could not be determined
     */
    hasEncryptedData(){
        this._archive = this._runCode.openArchive( this._filePtr, this._fileLength, this._passphrase );
        this._runCode.getNextEntry(this._archive);
        const status = this._runCode.hasEncryptedEntries(this._archive);
        if( status === 0 ){
            return false;
        } else if( status > 0 ){
            return true;
        } else {
            return null;
        }
    }

    /**
     * set passphrase to be used with archive
     * @param {*} passphrase 
     */
    setPassphrase(passphrase){
        this._passphrase = passphrase;
    }

    /**
     * get archive entries
     * @param {boolean} skipExtraction
     * @param {string} except don't skip this entry
     */
    *entries(skipExtraction = false, except = null){
        this._archive = this._runCode.openArchive( this._filePtr, this._fileLength, this._passphrase );
        let entry;
        while( true ){
            entry = this._runCode.getNextEntry(this._archive);
            if( entry === 0 ) break;

            const entryData = {
                size: this._runCode.getEntrySize(entry),
                path: this._runCode.getEntryName(entry),
                type: TYPE_MAP[this._runCode.getEntryType(entry)],
                ref: entry,
            };

            if( entryData.type === 'FILE' ){
                let fileName = entryData.path.split('/');
                entryData.fileName = fileName[fileName.length - 1];
            }

            if( skipExtraction && except !== entryData.path ){
                this._runCode.skipEntry(this._archive);
            }else{
                const ptr = this._runCode.getFileData(this._archive,entryData.size);
                if( ptr < 0 ){
                    throw new Error(this._runCode.getError(this._archive));
                }
                entryData.fileData = this._wasmModule.HEAP8.slice(ptr,ptr+entryData.size);
                this._wasmModule._free(ptr);
            }
            yield entryData;
        }
    }

    _loadFile(fileBuffer,resolve,reject){
        try{
            const array = new Uint8Array(fileBuffer);
            this._fileLength = array.length;
            this._filePtr = this._runCode.malloc(this._fileLength);
            this._wasmModule.HEAP8.set(array, this._filePtr);
            resolve();
        }catch(error){
            reject(error);
        }
    }

    _promiseHandles(){
        let resolve = null,reject = null;
        const promise = new Promise((_resolve,_reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        return { promise, resolve, reject };
    }
    
}