import { COSMETICS, RARITY_CLASSES, RARITY_LABELS, SLOT_LABELS } from '@/data/cosmetics'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { cn, formatNumber } from '@/lib/cn'
import { useGameStore } from '@/store/gameStore'
import { toast } from '@/store/toastStore'
import type { CosmeticSlot } from '@/types'

const SLOTS: CosmeticSlot[] = ['frame', 'title', 'aura']

const SLOT_ICONS: Record<CosmeticSlot, string> = {
  frame: 'Circle',
  title: 'Star',
  aura: 'Sparkles',
}

export function InventoryPanel() {
  const inventory = useGameStore((state) => state.inventory)
  const equipped = useGameStore((state) => state.equipped)
  const coins = useGameStore((state) => state.coins)
  const spendCoins = useGameStore((state) => state.spendCoins)
  const unlockCosmetic = useGameStore((state) => state.unlockCosmetic)
  const equipCosmetic = useGameStore((state) => state.equipCosmetic)

  const buy = (id: string, price: number, name: string) => {
    if (!spendCoins(price)) {
      toast({
        kind: 'aviso',
        title: 'Moedas insuficientes',
        description: `Faltam ${formatNumber(price - coins)} moedas para ${name}.`,
        icon: 'Coins',
      })
      return
    }
    unlockCosmetic(id)
  }

  return (
    <Card>
      <CardHeader
        title="Inventário cosmético"
        subtitle="As moedas servem apenas para personalização"
        icon="Gift"
        action={
          <Badge tone="gold" icon="Coins">
            {formatNumber(coins)}
          </Badge>
        }
      />
      <CardBody className="space-y-5 pt-3">
        {SLOTS.map((slot) => {
          const items = COSMETICS.filter((item) => item.slot === slot)
          return (
            <section key={slot}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name={SLOT_ICONS[slot]} size={15} className="text-ink-muted" />
                {SLOT_LABELS[slot]}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const owned = inventory.includes(item.id)
                  const isEquipped = equipped[slot] === item.id

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'rounded-xl border p-3.5',
                        isEquipped ? 'border-cyan-electric/60 bg-cyan-electric/5' : 'border-night-600 bg-night-800/40',
                        !owned && 'opacity-75',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-night-600"
                          style={
                            slot === 'title'
                              ? undefined
                              : { background: item.value, opacity: owned ? 1 : 0.4 }
                          }
                        >
                          {slot === 'title' && <Icon name="Star" size={16} className="text-gold" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                            <span
                              className={cn(
                                'rounded-full border px-1.5 py-px text-[10px] font-medium',
                                RARITY_CLASSES[item.rarity],
                              )}
                            >
                              {RARITY_LABELS[item.rarity]}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{item.description}</p>

                          <div className="mt-2.5 flex items-center gap-2">
                            {!owned ? (
                              <Button size="sm" variant="gold" icon="Coins" onClick={() => buy(item.id, item.price, item.name)}>
                                {formatNumber(item.price)}
                              </Button>
                            ) : isEquipped ? (
                              <Button size="sm" variant="ghost" onClick={() => equipCosmetic(slot, undefined)}>
                                Remover
                              </Button>
                            ) : (
                              <Button size="sm" icon="Check" onClick={() => equipCosmetic(slot, item.id)}>
                                Equipar
                              </Button>
                            )}
                            {isEquipped && <Badge tone="cyan">Equipado</Badge>}
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </CardBody>
    </Card>
  )
}
