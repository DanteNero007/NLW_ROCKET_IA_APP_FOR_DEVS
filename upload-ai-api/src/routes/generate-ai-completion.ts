
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from 'zod'
import { createReadStream } from 'fs'
import { streamToResponse, OpenAIStream } from 'ai'
import { openai } from "../lib/openai";
import { Stream } from "stream";


export async function generateAiCompletionRoute(app:FastifyInstance){
  app.post('/ai/complete', async (req, reply)=>{
     const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5)
    })

    const { temperature, videoId, prompt } = bodySchema.parse(req.body)

    const video = await prisma.video.findFirstOrThrow({
      where:{
          id: videoId,
      }
    })

    if(!video.transcription){
      return reply.status(400).send({error:'video transcription was not generated yet'})
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages:[
        {role: 'user', content:promptMessage},
      ],
      stream: true,

    })

    const stream = OpenAIStream(response)

    streamToResponse(stream, reply.raw,{
      headers:{
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GEt, POST, PUT, DELETE, OPTIONS',

      }
    })

    })

}
  







