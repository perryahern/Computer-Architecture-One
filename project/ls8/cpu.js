/**
 * LS-8 v2.0 emulator skeleton code
 */

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers R0-R7
        
        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg[7] = 0xF4; // Stack Pointer
    };
	
    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    };

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
    };

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    };

    /**
     * ALU functionality
     *
     * The ALU is responsible for math and comparisons.
     *
     * If you have an instruction that does math, i.e. MUL, the CPU would hand
     * it off to it's internal ALU component to do the actual work.
     *
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                return this.reg[regA] * this.reg[regB];
                break;
        };
    };

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (IR--can just be a local variable here)
        // from the memory address pointed to by the PC. (I.e. the PC holds the
        // index into memory of the next instruction.)

        let IR = this.ram.read(this.reg.PC);

        // Debugging output
        // console.log(`${this.reg.PC}: ${IR.toString(2)}`);

        // Get the two bytes in memory _after_ the PC in case the instruction
        // needs them.

        let operandA = this.ram.read(this.reg.PC + 1);
        let operandB = this.ram.read(this.reg.PC + 2);

        // Execute the instruction. Perform the actions for the instruction as
        // outlined in the LS-8 spec.

        // mnemonics for the instructions
        const LDI = 0b10011001;
        const PRN = 0b01000011;
        const MUL = 0b10101010;
        const PUSH = 0b01001101;
        const POP = 0b01001100;
        const HLT = 0b00000001;

        // handlers for the functionality of each instruction
        const handle_LDI = (operandA, operandB) => {
            this.reg[operandA] = operandB;
        };    
        const handle_PRN = (operandA) => {
            console.log(this.reg[operandA]);
        };    
        const handle_MUL = (operandA, operandB) => {
            this.reg[operandA] = this.alu('MUL', operandA, operandB);
        };
        const handle_PUSH = (operandA) => {
            this.ram.write(--this.reg[7], this.reg[operandA]);
        };
        const handle_POP = (operandA) => {
            this.reg[operandA] = this.ram.read(this.reg[7]++);
        };
        const handle_HLT = () => this.stopClock();

        // handler for invalid instruction
        const handle_invalid_instruction = (instruction) => {
            console.log(`${instruction.toString(2)} is not a valid instruction; halting operation.`);
            handle_HLT();
        };    

        // branch table to pair mnemonics with functions
        const branchTable = {
            [LDI]: handle_LDI,
            [PRN]: handle_PRN,
            [MUL]: handle_MUL,
            [PUSH]: handle_PUSH,
            [POP]: handle_POP,
            [HLT]: handle_HLT,
        };

        // call the function if it is in the branch table or handle invalid instruction
        if (Object.keys(branchTable).includes(IR.toString())) {
            branchTable[IR](operandA, operandB);
        } else {
            handle_invalid_instruction(IR);
        };

        // Increment the PC register to go to the next instruction. Instructions
        // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
        // instruction byte tells you how many bytes follow the instruction byte
        // for any particular instruction.
        
        // !!! IMPLEMENT ME
        this.reg.PC += (IR >>> 6) + 1;
    };
};

module.exports = CPU;
