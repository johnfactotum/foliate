/* eslint-disable no-undef */
import libarchive from './wasm-gen/libarchive.js';

export class WasmModule{
    constructor(){
        this.preRun = [];
        this.postRun = [];
        this.totalDependencies = 0;
    }

    print(...text){
        console.log(text);
    }

    printErr(...text){
        console.error(text);
    }

    initFunctions(){
        this.runCode = {
            // const char * get_version()
            getVersion: this.cwrap('get_version', 'string', []),
            // void * archive_open( const void * buffer, size_t buffer_size)
            // retuns archive pointer
            openArchive: this.cwrap('archive_open', 'number', ['number','number','string']),
            // void * get_entry(void * archive)
            // return archive entry pointer
            getNextEntry: this.cwrap('get_next_entry', 'number', ['number']),
            // void * get_filedata( void * archive, size_t bufferSize )
            getFileData: this.cwrap('get_filedata', 'number', ['number','number']),
            // int archive_read_data_skip(struct archive *_a)
            skipEntry: this.cwrap('archive_read_data_skip', 'number', ['number']),
            // void archive_close( void * archive )
            closeArchive: this.cwrap('archive_close', null, ['number'] ),
            // la_int64_t archive_entry_size( struct archive_entry * )
            getEntrySize: this.cwrap('archive_entry_size', 'number', ['number']),
            // const char * archive_entry_pathname( struct archive_entry * )
            getEntryName: this.cwrap('archive_entry_pathname', 'string', ['number']),
            // __LA_MODE_T archive_entry_filetype( struct archive_entry * )
            /*
            #define AE_IFMT		((__LA_MODE_T)0170000)
            #define AE_IFREG	((__LA_MODE_T)0100000) // Regular file
            #define AE_IFLNK	((__LA_MODE_T)0120000) // Sybolic link
            #define AE_IFSOCK	((__LA_MODE_T)0140000) // Socket
            #define AE_IFCHR	((__LA_MODE_T)0020000) // Character device
            #define AE_IFBLK	((__LA_MODE_T)0060000) // Block device
            #define AE_IFDIR	((__LA_MODE_T)0040000) // Directory
            #define AE_IFIFO	((__LA_MODE_T)0010000) // Named pipe
            */
            getEntryType: this.cwrap('archive_entry_filetype', 'number', ['number']),
            // const char * archive_error_string(struct archive *); 
            getError: this.cwrap('archive_error_string', 'string', ['number']),
    
            /*
            * Returns 1 if the archive contains at least one encrypted entry.
            * If the archive format not support encryption at all
            * ARCHIVE_READ_FORMAT_ENCRYPTION_UNSUPPORTED is returned.
            * If for any other reason (e.g. not enough data read so far)
            * we cannot say whether there are encrypted entries, then
            * ARCHIVE_READ_FORMAT_ENCRYPTION_DONT_KNOW is returned.
            * In general, this function will return values below zero when the
            * reader is uncertain or totally incapable of encryption support.
            * When this function returns 0 you can be sure that the reader
            * supports encryption detection but no encrypted entries have
            * been found yet.
            *
            * NOTE: If the metadata/header of an archive is also encrypted, you
            * cannot rely on the number of encrypted entries. That is why this
            * function does not return the number of encrypted entries but#
            * just shows that there are some.
            */
            // __LA_DECL int	archive_read_has_encrypted_entries(struct archive *);
            entryIsEncrypted: this.cwrap('archive_entry_is_encrypted', 'number', ['number']),
            hasEncryptedEntries: this.cwrap('archive_read_has_encrypted_entries', 'number', ['number']),
            // __LA_DECL int archive_read_add_passphrase(struct archive *, const char *);
            addPassphrase: this.cwrap('archive_read_add_passphrase', 'number', ['number','string']),
          //this.stringToUTF(str), //
            string: (str) => this.allocate(this.intArrayFromString(str), 'i8', 0),
            malloc: this.cwrap('malloc', 'number', ['number']),
            free: this.cwrap('free', null, ['number']),
        };
        //console.log(this.runCode.getVersion());
    }

    monitorRunDependencies(){}

    locateFile(path /* ,prefix */ ){
        return `wasm-gen/${path}`;
    }
}

export function getWasmModule(cb){
    libarchive( new WasmModule() ).then( (module) => {
        module.initFunctions();
        cb(module);
    });
}
