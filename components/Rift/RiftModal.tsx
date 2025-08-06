import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Rift} from "@/types/rift";
import {cn} from "@/lib/utils";
import {battlesRepository} from "@/repository/battles";
import {useRouter} from "next/navigation";

type RiftModalProps = {
    open: boolean;
    onClose: () => void;
    data: Rift | null
}

export function RiftModal({ open, onClose, data }: RiftModalProps) {
    const router = useRouter();
    if (!data) return null;

    const handleEnter = async () => {
        const res = await battlesRepository.api.createBattle(data.id)
        if (res) {
            console.log(res)
            router.push(`/battle/${res.id}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700 shadow-xl sm:max-w-[500px] text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl text-white">{data.name}</DialogTitle>
                    <DialogDescription className="text-sm text-neutral-400">
                        View rift details and potential rewards.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 mt-2">
                    {/* Difficulty */}
                    <div className="grid gap-1">
                        <Label className="text-neutral-400">Difficulty</Label>
                        <span
                            className={cn(
                                "w-fit px-2 py-1 rounded text-sm font-medium",
                                data.difficulty === "EASY" && "bg-green-500/20 text-green-400",
                                data.difficulty === "MEDIUM" && "bg-blue-500/20 text-blue-400",
                                data.difficulty === "HARD" && "bg-yellow-500/20 text-yellow-400",
                                data.difficulty === "VERY_HARD" && "bg-red-500/20 text-red-400",
                                data.difficulty === "EXTREME" && "bg-purple-500/20 text-purple-400"
                            )}
                        >
        {data.difficulty.replace('_', ' ')}
    </span>
                    </div>


                    {/* Status */}
                    <div className="grid gap-1">
                        <Label className="text-neutral-400">Status</Label>
                        <span
                            className={cn(
                                "w-fit px-2 py-1 rounded text-sm font-medium",
                                data.status === "OPEN" && "bg-green-500/20 text-green-400",
                                data.status === "CLOSED" && "bg-neutral-500/20 text-neutral-400"
                            )}
                        >
                        {data.status}
                    </span>
                    </div>

                    {/* Rewards */}
                    <div className="grid gap-2">
                        <Label className="text-neutral-400">Rewards</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {data.rewards.map((reward, index) => (
                                <div key={index} className="flex items-start gap-3 rounded border border-neutral-700 p-3 bg-neutral-800/60">
                                    <img
                                        src={reward.item.iconUrl}
                                        alt={reward.item.name}
                                        className="w-12 h-12 object-contain rounded"
                                    />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "text-sm font-medium",
                                                reward.item.rarity === "LEGEND" && "text-purple-400",
                                                reward.item.rarity === "COMMON" && "text-gray-300"
                                            )}
                                        >
                                            {reward.item.name} x{reward.quantity}
                                        </span>
                                            <span className="text-xs text-neutral-400">{reward.item.type}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400">{reward.item.description}</p>
                                        <div className="text-xs text-neutral-400 mt-1 flex flex-wrap gap-2">
                                            {reward.item.hpBonus !== 0 && <span>HP +{reward.item.hpBonus}</span>}
                                            {reward.item.strBonus !== 0 && <span>STR +{reward.item.strBonus}</span>}
                                            {reward.item.agiBonus !== 0 && <span>AGI +{reward.item.agiBonus}</span>}
                                            {reward.item.intBonus !== 0 && <span>INT +{reward.item.intBonus}</span>}
                                            {reward.item.vitBonus !== 0 && <span>VIT +{reward.item.vitBonus}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                        Close
                    </Button>
                    <Button variant="default" onClick={handleEnter} className="bg-green-600 hover:bg-green-700 text-white">
                        Enter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
