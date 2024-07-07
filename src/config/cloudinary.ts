import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { config } from './config';

cloudinary.config({ 
    cloud_name: config.CLOUDINARY_CLOUD, 
    api_key: config.CLOUDINARY_API_KEY, 
    api_secret: config.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localpath: string, fileName: string, folder: string, resource_type: 'auto' | 'image' | 'video' | 'raw', mimeType: string) => {
    try {
        console.log(`Uploading file: ${localpath}, as ${fileName} with MIME type ${mimeType}`);
        if (!localpath || !fileName || !mimeType) {
            console.error('Invalid parameters provided for upload');
            return null;
        }
        if(!resource_type){
            resource_type: 'auto';
        }
        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localpath, { 
            resource_type: resource_type,
            public_id: fileName, 
            folder: folder, 
            format: mimeType 
        });

        if (!response) {
            console.error('Failed to upload to Cloudinary');
            return null;
        }

        console.log('Upload successful:', response);
        fs.unlinkSync(localpath);

        return response;
    } catch (error) {
        console.error('Error during file upload:', error);
        try {
            fs.unlinkSync(localpath);
        } catch (unlinkError) {
            console.error('Error removing local file:', unlinkError);
        }

        return null;
    }
};

export { uploadOnCloudinary };
