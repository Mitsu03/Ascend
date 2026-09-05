# Designs

Arquivo dos pacotes de design (*handoffs*) da Ascend. Cada pacote fica numa
pasta própria, datada, e **guarda-se tal como foi recebido** — incluindo o que
já estiver desatualizado. O objetivo é ter o histórico das direções visuais e
poder voltar atrás, não manter um espelho do código.

## Convenção

```
design/
  AAAA-MM-DD-nome-curto/
    README.md          ← o documento de handoff, como veio
    VALIDACAO.md       ← o que foi verificado contra o código, e as divergências
    PARA-O-DESIGN.md   ← o que ficou por resolver e volta para o desenho
    ...                ← protótipos, capturas, arte, tokens
```

`VALIDACAO.md` é escrito por quem recebe o pacote e diz sempre contra que
commit do `main` a validação foi feita. Sem isso, um handoff com meio ano lê-se
como se fosse a especificação atual.

`PARA-O-DESIGN.md` só existe quando há alguma coisa a devolver. É o contrário
do `CORRECOES.md` que vem dentro do pacote: esse é a lista do que o autor do
design já corrigiu, este é a lista do que só apareceu ao implementar.

Uma revisão de um pacote é um **pacote novo**, em pasta nova — não se
sobrescreve a anterior.

## Pacotes

| Pasta | Direção | Estado |
|---|---|---|
| [`2026-09-02-bleach-shinigami/`](2026-09-02-bleach-shinigami/) | **Bleach** — preto de shihakushō e carmim, chanfros, Saira Condensed. 9 ecrãs, HUD + `[ MENU ]` | Validado e implementado (camada visual). Ver [`VALIDACAO.md`](2026-09-02-bleach-shinigami/VALIDACAO.md); sete pontos devolvidos em [`PARA-O-DESIGN.md`](2026-09-02-bleach-shinigami/PARA-O-DESIGN.md) |
| [`2026-09-02-prototipo-shinigami/`](2026-09-02-prototipo-shinigami/) | Tema escuro laranja/carmim, cantos redondos, 5 ecrãs + celebração | Substituído pelo Bleach. Ver [`VALIDACAO.md`](2026-09-02-prototipo-shinigami/VALIDACAO.md) — tinha quatro correções por fazer, todas resolvidas na revisão seguinte |
