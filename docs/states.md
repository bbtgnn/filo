/_ types _/

Block = {
x: number
y: number
width: number
height: number
}

Sign = 1 | -1

Dimension = "x" | "y"

/_ states _/

[idle]

actions:

- selectBlock(block: Block) -> [focus]

---

[focus]

properties:

- focusedBlock: Block

actions:

- moveCursor(amount: number, sign: Sign) -> [focus]
- moveFocus(dimension: Dimension, sign: Sign) -> [focus]
- splitBlock() -> [positioning]
- exit() -> [idle]

---

[positioning]

properties:

- blockIn: Block
- blockOut: Block
- blockQueue?: Block

actions:

- moveBlockIn(dimension: Dimension, sign: Sign) -> [positioning]
- moveBlockOut(dimension: Dimension, sign: Sign) -> [positioning]
- confirmBlockOut()
  -> if not blockQueue [focus]
  -> if blockQueue [positioning]
- exit() -> [focus]
