"use client";

import { io } from "socket.io-client";
import {config} from "@/config/app";

export const socket = io(config.baseUrl);
