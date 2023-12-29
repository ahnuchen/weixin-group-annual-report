import {IMessage} from "../../messages.ts";
import './styles.scss'

export default function UserMsg({message}: { message: IMessage }) {
    if (message.type === 1) {
        return <div className="item item-left">
            <div className="avatar"><img src={message.avatar_path} alt="头像"/></div>
            <div className="content-wrapper content-wrapper-left">
                <div className="displayname">{message.displayname}</div>
                <div className="bubble bubble-left" dangerouslySetInnerHTML={{__html: message.text}}></div>
            </div>
        </div>
    }
    if (message.type === 3) {
        return <div className="item item-left">
            <div className="avatar"><img src={message.avatar_path} /></div>
            <div className="content-wrapper content-wrapper-left">
                <div className="displayname">{message.displayname}</div>
                <div className="chat-image"><img
                    src={message.text}/>
                </div>
            </div>
        </div>
    }
}