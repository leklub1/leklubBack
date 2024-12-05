import { S3Client} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Permet de crée les fichiers initiaux dans S3
 * @param {*} userId 
 */
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

export const uploadProfilePhoto = async (userId, base64Photo) => {
    try {

        const buffer = Buffer.from(base64Photo, 'base64');
        
        const photoParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `users/${userId}/photo/profilPicture.png`,
            Body: buffer,
            ContentType: 'image/png',
        };

        const uploadPhoto = new Upload({
            client: s3Client,
            params: photoParams
        });

        await uploadPhoto.done();
        console.log('Photo de profil téléchargée avec succès!');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement de la photo de profil dans S3:', error);
        throw new Error('Erreur lors du téléchargement de la photo de profil');
    }
};

export const uploadQrCode = async (userId, qrCode) => {
    try {
      
        const photoParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `users/${userId}/qrCode/qrCode.png`,
            Body: qrCode,
            ContentType: 'image/png',
        };

        const uploadPhoto = new Upload({
            client: s3Client,
            params: photoParams
        });

        await uploadPhoto.done();
        console.log('QrCode téléchargée avec succès!');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement du qr code dans S3:', error);
        throw new Error('Erreur lors du téléchargement du qr code dans S3');
    }
};