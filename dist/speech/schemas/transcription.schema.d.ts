import { Document } from 'mongoose';
export type TranscriptionDocument = Transcription & Document & {
    createdAt: Date;
    updatedAt: Date;
};
export declare class Transcription {
    userId: string;
    transcribedText: string;
    language: string;
    detectedLanguage: string;
    confidence: number;
    audioDuration: number;
    segments: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
    }>;
    processingTime: number;
    audioFileUrl?: string;
}
export declare const TranscriptionSchema: import("mongoose").Schema<Transcription, import("mongoose").Model<Transcription, any, any, any, (Document<unknown, any, Transcription, any, import("mongoose").DefaultSchemaOptions> & Transcription & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Transcription, any, import("mongoose").DefaultSchemaOptions> & Transcription & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Transcription>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transcription, Document<unknown, {}, Transcription, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transcribedText?: import("mongoose").SchemaDefinitionProperty<string, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    language?: import("mongoose").SchemaDefinitionProperty<string, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    detectedLanguage?: import("mongoose").SchemaDefinitionProperty<string, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    confidence?: import("mongoose").SchemaDefinitionProperty<number, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    audioDuration?: import("mongoose").SchemaDefinitionProperty<number, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    segments?: import("mongoose").SchemaDefinitionProperty<{
        id: number;
        start: number;
        end: number;
        text: string;
    }[], Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    processingTime?: import("mongoose").SchemaDefinitionProperty<number, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    audioFileUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transcription, Document<unknown, {}, Transcription, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcription & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Transcription>;
