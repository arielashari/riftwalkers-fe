import { Scene } from 'phaser';
import Background from '@/public/background/orig_big.png'
import {socket} from "@/app/socket";

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', Background.src);
        socket.on('connect', () => console.log('[WS] Connected'));
        socket.on('disconnect', () => console.log('[WS] Disconnected'));
    }

    create ()
    {
        const store = this.game.registry.get('playerStore');
        console.log('Boot got store:', store);

        this.scene.start('Preloader');    }
}
