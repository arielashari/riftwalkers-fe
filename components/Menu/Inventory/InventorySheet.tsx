'use client'

import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle  } from "@/components/ui/sheet";
import {InventoryItem, rarityColors} from "@/types/item";
import { ScrollArea } from "../../ui/scroll-area";
import {useEffect, useState} from "react";
import {playersRepository} from "@/repository/players";

type InventorySheetProps = {
    open: boolean;
    onClose: () => void;
}

const InventorySheet = ({ open, onClose }: InventorySheetProps) => {
    const { data: inventory, isLoading, mutate } = playersRepository.hooks.useGetInventory();
    const equipItem = playersRepository.hooks.useEquipItem();

    if (isLoading || !inventory) return null;

    const equippedItems = inventory.data.filter((i: InventoryItem) => i.isEquipped);
    const bagItems = inventory.data.filter((i: InventoryItem) => !i.isEquipped);

    const handleEquip = async (itemId: string, isEquipped: boolean) => {
        try {
            await equipItem.trigger({ itemId, isEquipped });
            mutate(); // refresh inventory after successful equip
        } catch (err) {
            console.error("Failed to equip item", err);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="bg-black/80 backdrop-blur-md shadow-lg text-white w-[90vw] sm:w-[400px]">
                <SheetHeader className="flex flex-row justify-between items-center">
                    <SheetTitle className="text-white">Inventory</SheetTitle>
                </SheetHeader>

                {/* Equipped Items */}
                <div className="mt-4">
                    <h2 className="text-sm text-gray-300 mb-2">Equipped</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {equippedItems.length > 0 ? (
                            equippedItems.map((item: InventoryItem) => (
                                <div key={item.id} className="bg-white/10 p-2 rounded-md flex gap-2 items-center">
                                    <img src={item.item.iconUrl} alt={item.item.name} className="w-8 h-8 rounded-sm" />
                                    <div>
                                        <div className={rarityColors[item.item.rarity]}>
                                            {item.item.name}
                                        </div>
                                        <div className="text-xs text-gray-400">{item.item.slot}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-400">Nothing equipped</div>
                        )}
                    </div>
                </div>

                {/* Bag Items */}
                <div className="mt-6">
                    <h2 className="text-sm text-gray-300 mb-2">Bag</h2>
                    <ScrollArea className="h-40 pr-2">
                        <div className="flex flex-col gap-2 text-sm">
                            {bagItems.length > 0 ? (
                                bagItems.map((item: InventoryItem) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleEquip(item.id, !item.isEquipped)}
                                        disabled={equipItem.isMutating}
                                        className="bg-white/10 hover:bg-white/20 p-2 rounded-md flex items-center gap-3 text-left w-full"
                                    >
                                        <img src={item.item.iconUrl} alt={item.item.name} className="w-8 h-8 rounded-sm" />
                                        <div className="flex flex-col">
                                            <span className={rarityColors[item.item.rarity]}>
                                                {item.item.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400">Inventory is empty</div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default InventorySheet;
