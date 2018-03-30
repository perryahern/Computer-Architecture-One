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
        this.reg.FL = 0; // Flags register
        this.reg[7] = 0xF4; // Stack Pointer
        this.reg[6] = 0;
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
        // this.timer = setInterval(() => {
        //     this.reg[6] = 0b00000001;
        // }, 1000);

        this.clock = setInterval(() => {
            this.tick();
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
            case 'ADD':
                return this.reg[regA] + this.reg[regB];
                break;
        };
    };

    /**
     * Advances the CPU one cycle
     */
    tick() {
        const interrupt_general = () => {
        // viewing high RAM to test
            for (let i = 255; i > 234; i--) {
                console.log(`ram index ${i}: `, this.ram.read(i));
            };
            console.log('----------');
            console.log('PC: ', this.reg.PC);
            for (let i = 0; i < 8; i++) {
                console.log(`register ${i}: `, this.reg[i]);
            };
            console.log('----------');
            
            // disable interrupts

            // clear the bit
            // this.reg[6] = this.reg[6] & 0b11111110;
            this.reg[6] = 0;

            // push PC register onto stack
            handle_PUSHval(this.reg.PC);
            
            // push FL register onto stack
                // FL register not implemented yet
            
            // push R0 to R6 onto stack in order
            for (let i = 0; i < 8; i++) {
                handle_PUSHval(this.reg[i]);
            };

            // look up address of interrupt handler in interrupt vector table
            
            // set PC to the handler address
            this.reg.PC = this.ram.read(0xF8);

        // viewing high ram to test   
            console.log('end of int general, PC: ', this.reg.PC);
            for (let i = 255; i > 234; i--) {
                console.log(`ram index ${i}: `, this.ram.read(i));
            };
            console.log('----------');
        };
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
        const ADD = 0b10101000;
        const CALL = 0b01001000;
        const CMP = 0b10100000;
        const HLT = 0b00000001;
        const JEQ = 0b01010001;
        const JGT = 0b01010100;
        const JLT = 0b01010011;
        const JMP = 0b01010000;
        const JNE = 0b01010010;
        const LDI = 0b10011001;
        const MUL = 0b10101010;
        const POP = 0b01001100;
        const PRA = 0b01000010;
        const PRN = 0b01000011;
        const PUSH = 0b01001101;
        const RET = 0b00001001;
        const ST = 0b10011010;

        // mnemonics for interrupt table
        const TIMER = 0b00000001;

        // special variables
        const SP = 7;   // Stack Pointer
        const IS = 6;   // Interrupt Status

        // OpCode handling functions and helpers
        const handle_ADD = (registerA, registerB) => {
            this.reg[registerA] = this.alu('ADD', registerA, registerB);
        };
        
        const handle_CALL = (register) => {
            handle_PUSHval(this.reg.PC + 2);
            this.reg.PC = this.reg[register];
        };

        const handle_CMP = (registerA, registerB) => {
            switch (true) {
                case this.reg[registerA] === this.reg[registerB]:
                    this.reg.FL = 0b00000001;
                    break;
                case this.reg[registerA] > this.reg[registerB]:
                    this.reg.FL = 0b00000010;
                    break;
                case this.reg[registerA] < this.reg[registerB]:
                    this.reg.FL = 0b00000100;
                    break;
            };
        };
        
        const handle_HLT = () => this.stopClock();

        const handle_JEQ = (register) => {
            if (this.reg.FL === 0b00000001) {
                handle_JMP(register);
            } else {
                this.reg.PC += 2;
            };
        };

        const handle_JGT = (register) => {
            if (this.reg.FL === 0b00000010) {
                handle_JMP(register);
            } else {
                this.reg.PC += 2;
            };
        };

        const handle_JLT = (register) => {
            if (this.reg.FL === 0b00000100) {
                handle_JMP(register);
            } else {
                this.reg.PC += 2;
            };
        };

        const handle_JMP = (register) => {
            this.reg.PC = this.reg[register];
        };

        const handle_JNE = (register) => {
            if (this.reg.FL !== 0b00000001) {
                handle_JMP(register);
            } else {
                this.reg.PC += 2;
            };
        };

        const handle_LDI = (register, value) => {
            this.reg[register] = value;
        };

        const handle_MUL = (registerA, registerB) => {
            this.reg[registerA] = this.alu('MUL', registerA, registerB);
        };
        
        const handle_POP = (register) => {
            this.reg[register] = handle_POPval();
        };
        
        const handle_POPval = () => {
            return this.ram.read(this.reg[SP]++);
        };

        const handle_PRA = (register) => {
            console.log(String.fromCharCode(this.reg[register]));
        };

        const handle_PRN = (register) => {
            console.log(this.reg[register]);
        };  

        const handle_PUSH = (register) => {
            this.ram.write(--this.reg[SP], this.reg[register]);
        };

        const handle_PUSHval = (value) => {
            this.ram.write(--this.reg[SP], value);
        };

        const handle_RET = () => {
            this.reg.PC = handle_POPval();
        };

        const handle_ST = (registerA, registerB) => {
            this.ram.write(this.reg[registerA], this.reg[registerB]);
        };

        // const interrupt_timer = () => {
        //     console.log('Timer interrupt!');
        //     this.reg[IS] = 0;
        // };

        // handler for invalid instructions
        const handle_invalid_instruction = (instruction) => {
            console.log(`${instruction.toString(2)} is not a valid instruction; halting operation.`);
            handle_HLT();
        };    

        // branch table to pair mnemonics with functions
        const branchTable = {
            [ADD]: handle_ADD,
            [CALL]: handle_CALL,
            [CMP]: handle_CMP,
            [HLT]: handle_HLT,
            [JEQ]: handle_JEQ,
            [JGT]: handle_JGT,
            [JLT]: handle_JLT,
            [JMP]: handle_JMP,
            [JNE]: handle_JNE,
            [LDI]: handle_LDI,
            [MUL]: handle_MUL,
            [POP]: handle_POP,
            [PRA]: handle_PRA,
            [PRN]: handle_PRN,
            [PUSH]: handle_PUSH,
            [RET]: handle_RET,
            [ST]: handle_ST,
        };


        // branch table for interrupts
        // const interruptTable = {
        //     [TIMER]: interrupt_timer,
        // };

        // check to see if there are any interrupts
        if (this.reg[IS] !== 0) {
            // >>>>>>>>>> PROBLEM TO FIX: this will only work for one interrupt at a time <<<<<<<<<<
            // if (Object.keys(interruptTable).includes(this.reg[IS].toString())) {
            //     interruptTable[this.reg[IS]]();
            // } else {
            //     console.log('Interrupt table error');
            // };
            interrupt_general();
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
        switch (IR) {
            case CALL:
            case JEQ:
            case JGT:
            case JLT:
            case JMP:
            case JNE:
            case RET:
              break;
            default:  // move PC for all commands that do not directly set it
              this.reg.PC += (IR >>> 6) + 1;
              break;
        };
    };
};

module.exports = CPU;
