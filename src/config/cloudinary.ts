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
            resource_type = 'auto';
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

const extractPublicIdFromUrl = (cloudinaryUrl: string, resource_type: 'auto' | 'image' | 'video' | 'raw'): string => {
    const parts = cloudinaryUrl.split('/');
    if(resource_type === 'raw'){
        return parts.at(-2) + "/" + parts.at(-1);
    }
    else{
        return parts.at(-2) + "/" + parts.at(-1)?.split('.').at(-2);
    }
}

const deleteFromCloudinary = async (cloudinaryUrl: string, resource_type: 'auto' | 'image' | 'video' | 'raw') => {
    console.log(`Deleting file: ${cloudinaryUrl}, with resource type ${resource_type}`);
    if(!cloudinary || !resource_type){
        console.error('Invalid parameters provided for upload');
        return null
    }
    try {
        const publicId = extractPublicIdFromUrl(cloudinaryUrl, resource_type);
        console.log('Public Id: ' + publicId)
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resource_type });
        console.log(response);
        if(response.result === 'ok'){
            return response;
        }
        else{
            return null;
        }
    } catch (error) {
        console.error("Failed to delete from Cloudinary", error)
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
