type MessageType = 0 | 1 | 3 | 49 | 57 | 43 | 34
// 0 时间 1 文字 3 图片 49/57 49/6 文件 43 视频
export interface IMessage {
    type: MessageType,
    text: string,
    avatar_path: string,
    timestamp: number
    is_send: number
    is_chatroom?: number
    displayname?: string
    sub_type?: number
    refer_text?: string
    link?: string
    [key:string]: unknown
}

export const messages: IMessage[] = {{{messages}}}

export const wordCountList = {{{wordCountList}}}