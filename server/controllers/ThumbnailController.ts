import { Request, Response } from 'express';
import { Thumbnail } from '../models/Thumbnail.js';
import { GenerateContentConfig } from '@google/genai';
import ai from '../configs/ai.js';
import path from 'path';
import  fs  from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts = {
  boldGraphic:
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",

  techFuturistic:
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",

  minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",

  photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",

  illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style"
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",

  sunset:
    "warm sunset tones, orange, pink and purple hues, soft gradients, cinematic glow",

  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",

  neon:
    "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",

  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",

  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",

  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",

  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic"
};


export const generateThumbnail = async (req: Request, res: Response) => {

    try {
        const {userId} = req.session;
        const {
            title, 
            prompt: user_prompt,
            description, 
            style, 
            aspect_ratio, 
            color_scheme, 
            text_overlay, 
        } = req.body;

        const thumbnail =  await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true,
        })

        const model = "gemini-3-image-preview"
        const generetionConfigs: GenerateContentConfig  = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ["IMAGE"],
            imageConfig: {
                aspectRatio: aspect_ratio || "16:9",
                imageSize: "1k"
            }
        }

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: ${title}`

        if(color_scheme) {
            prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`
        }

        if(user_prompt) {
            prompt += ` Additionally, incorporate the following details: ${user_prompt}`
        }

        prompt += ` The thumbnail should be ${aspect_ratio}, virually stunning, and optimized for high click-through rates. Make it bold, proffessional, and impossible to ignore.`

        // Generate the Image using Gemini API 
        const response: any = await ai.models.generateContent({
            model,
            contents:[prompt],
            config: generetionConfigs
        });

        // Check if the response is valid 
        if(!response?.candidates?.[0]?.content?.parts){
            throw new Error("Invalid response from AI model");
        }

        const parts = response.candidates[0].content.parts;

        let finalBuffer: Buffer | null = null;
        for(const part of parts){
            if(part.inlineDate){
                finalBuffer = Buffer.from(part.inlineDate.data, 'base64');
            }
        }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join("images", filename);

        // Create the image directory if it doesn't exist
        fs.mkdirSync("images", { recursive: true });

        // Write the final image to the file
        fs.writeFileSync(filePath, finalBuffer!);

        const uploadResult = await cloudinary.uploader.upload(filePath, {resource_type: "image"});

        thumbnail.image_url = uploadResult.secure_url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.json({message: "Thumbnail generated successfully", thumbnail});

        // Clean up the local file
        fs.unlinkSync(filePath);

    } catch (error: any) {
        console.error("Error generating thumbnail:", error);
        res.status(500).json({ message: error.message });
    }
};

// Controller for Thumbnail Deletion
export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {userId} = req.session;

        await Thumbnail.findOneAndDelete({ _id: id, userId });

        res.json({ message: "Thumbnail deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting thumbnail:", error);
        res.status(500).json({ message: error.message });
    }
}