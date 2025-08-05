"use client";

import { io } from "socket.io-client";
import {config} from "@/config/app";

export const socket = io("wss://c4cc0bfe7a09.ngrok-free.app", {
    transports: ["websocket"],
});
