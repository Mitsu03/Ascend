import { COSMETICS, RARITY_CLASSES, SLOT_ORDER } from '@/data/cosmetics'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { useGameStore } from '@/store/gameStore'
import { toast } from '@/store/toastStore'
import type { CosmeticSlot } from '@/types'

const SLOT_ICONS: Record<CosmeticSlot, string> = {
  frame: 'Circle',
  title: 'Star',
  aura: 'Sparkles',
}

export function InventoryPanel() {
  const { t, n, loc } = useI18n()
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
        title: t.profile.notEnoughCoins,
        description: t.profile.notEnoughCoinsText(n(price - coins), name),
        icon: 'Coins',
      })
      return
    }
    unlockCosmetic(id)
  }

  return (
    <Card>
      <CardHeader
        title={t.profile.inventoryTitle}
        subtitle={t.profile.inventorySubtitle}
        icon="Gift"
        action={
          <Badge tone="gold" icon="Coins">
            {n(coins)}
          </Badge>
        }
      />
      <CardBody className="space-y-5 pt-3">
        {SLOT_ORDER.map((slot) => {
          const items = COSMETICS.filter((item) => item.slot === slot)
          return (
            <section key={slot}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name={SLOT_ICONS[slot]} size={15} className="text-ink-muted" />
                {t.cosmeticSlots[slot]}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const owned = inventory.includes(item.id)
                  const isEquipped = equipped[slot] === item.id
                  const name = loc(item.name)

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'rounded-xl border p-3.5',
                        isEquipped ? 'border-ember/60 bg-ember/5' : 'border-void-600 bg-void-800/40',
                        !owned && 'opacity-75',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-void-600"
                          style={slot === 'title' ? undefined : { background: item.value, opacity: owned ? 1 : 0.4 }}
                        >
                          {slot === 'title' && <Icon name="Star" size={16} className="text-gold" />}
                        </span>
                        {/*
                          O botão passou para a linha do nome. Estava sozinho
                          numa terceira linha por baixo da descrição, e com dez
                          cosméticos empilhados isso somava ~340 px de altura só
                          em linhas de um botão.
                        */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-ink">{name}</p>
                              <span
                                className={cn(
                                  'rounded-full border px-1.5 py-px text-[10px] font-medium',
                                  RARITY_CLASSES[item.rarity],
                                )}
                              >
                                {t.rarities[item.rarity]}
                              </span>
                              {/*
                                O estado equipado vê-se pela moldura acesa, pelo
                                fundo e pelo botão que passa a dizer «Retirar».
                                Para quem ouve o ecrã, fica aqui por escrito.
                              */}
                              {isEquipped && <span className="sr-only">{t.profile.equipped}</span>}
                            </div>
                            <span className="shrink-0">
                              {!owned ? (
                                <Button
                                  size="sm"
                                  variant="gold"
                                  icon="Coins"
                                  onClick={() => buy(item.id, item.price, name)}
                                >
                                  {n(item.price)}
                                </Button>
                              ) : isEquipped ? (
                                <Button size="sm" variant="ghost" onClick={() => equipCosmetic(slot, undefined)}>
                                  {t.profile.unequip}
                                </Button>
                              ) : (
                                <Button size="sm" icon="Check" onClick={() => equipCosmetic(slot, item.id)}>
                                  {t.profile.equip}
                                </Button>
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{loc(item.description)}</p>
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
