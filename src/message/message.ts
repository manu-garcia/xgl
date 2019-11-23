import { MessageBus } from "./messageBus";
import { IMessageHandler } from "./IMessageHandler";

export enum MessagePriotity {
    NORMAL,
    HIGH
}

export class Message {
    public code: string;

    public context: any;

    public sender: any;

    public priority: MessagePriotity;

    public constructor(code: string, sender: any, context?: any, priority: MessagePriotity = MessagePriotity.NORMAL) {
        this.code = code;
        this.sender = sender;
        this.context = context;
        this.priority = priority;
    }

    public static send(code: string, sender: any, context?: any): void {
        MessageBus.post(new Message(code, sender, context));
    }

    public static sendPriority(code: string, sender: any, context?: any): void {
        MessageBus.post(new Message(code, sender, context, MessagePriotity.HIGH));
    }

    public static subscribe(code: string, handler: IMessageHandler): void {
        MessageBus.addSubscription(code, handler);
    }

    public static unsubscribe(code: string, handler: IMessageHandler): void {
        MessageBus.removeSubscription(code, handler);
    }
}