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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{data.name}</DialogTitle>
                    <DialogDescription>
                        View rift details and potential rewards.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <Label className="text-muted-foreground">Difficulty</Label>
                        <span
                            className={cn(
                                "w-fit px-2 py-1 rounded text-sm font-medium",
                                data.difficulty === "EXTREME" && "bg-red-100 text-red-700",
                                data.difficulty === "HARD" && "bg-yellow-100 text-yellow-700",
                                data.difficulty === "NORMAL" && "bg-blue-100 text-blue-700"
                            )}
                        >
              {data.difficulty}
            </span>
                    </div>

                    <div className="grid gap-1">
                        <Label className="text-muted-foreground">Status</Label>
                        <span
                            className={cn(
                                "w-fit px-2 py-1 rounded text-sm font-medium",
                                data.status === "OPEN" && "bg-green-100 text-green-800",
                                data.status === "CLOSED" && "bg-gray-100 text-gray-600"
                            )}
                        >
              {data.status}
            </span>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-muted-foreground">Rewards</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {data.rewards.map((reward, index) => (
                                <div key={index} className="flex items-start gap-3 rounded border p-3">
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
                              reward.item.rarity === "LEGEND" && "text-purple-600",
                              reward.item.rarity === "COMMON" && "text-gray-600"
                          )}
                      >
                        {reward.item.name} x{reward.quantity}
                      </span>
                                            <span className="text-xs text-muted-foreground">{reward.item.type}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{reward.item.description}</p>
                                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
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
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="default" onClick={handleEnter}>
                        Enter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
