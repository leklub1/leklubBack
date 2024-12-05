import { S3Client} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const createS3Folders = async (userId) => {
    try {
        const dataFolderParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `users/${userId}/photo/`,
            Body: '',
        };
        const uploadData = new Upload({
            client: s3Client,
            params: dataFolderParams
        });
        await uploadData.done();

        const videosFolderParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `users/${userId}/qrCode/`,
            Body: '',
        };
        const uploadVideos = new Upload({
            client: s3Client,
            params: videosFolderParams
        });
        await uploadVideos.done();

    } catch (error) {
        console.error('Erreur lors de la création des dossiers S3:', error);
        throw new Error('Erreur lors de la création des dossiers S3');
    }
};