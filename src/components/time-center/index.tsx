import dayjs from "dayjs";
import {IMessage} from "../../messages.ts";

export default function TimeCenter({message}:{message: IMessage}) {
    return <div className="item item-center">
        <span>{dayjs(message!.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
    </div>
}