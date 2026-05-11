import httpClient from '../../../services/httpClient'
import { SIGNS_API_PREFIX } from '../constants'
import type {
  ClipPayload,
  RecognizeResponse,
  SampleMeta,
  SubmitTrainingSampleInput,
} from '../types'

export async function submitTrainingSample(
  input: SubmitTrainingSampleInput,
): Promise<SampleMeta> {
  const { data } = await httpClient.post<SampleMeta>(
    `${SIGNS_API_PREFIX}/samples`,
    input,
  )
  return data
}

export async function recognizeClip(clip: ClipPayload): Promise<RecognizeResponse> {
  const { data } = await httpClient.post<RecognizeResponse>(
    `${SIGNS_API_PREFIX}/recognize`,
    clip,
  )
  return data
}
