export enum ProcessType {
    Cleaning = 'Cleaning',
    Disassembly = 'Disassembly',
    PartSubstitution = 'PartSubstitution',
    Reassembly = 'Reassembly',
    Certification = 'Certification',
    Redesign = 'Redesign',
    Turning = 'Turning',
    Grinding = 'Grinding'
}

export const ProcessTypeLabels: Record<ProcessType, string> = {
    [ProcessType.Cleaning]: 'Cleaning',
    [ProcessType.Disassembly]: 'Disassembly',
    [ProcessType.PartSubstitution]: 'Part Substitution',
    [ProcessType.Reassembly]: 'Reassembly',
    [ProcessType.Certification]: 'Certification',
    [ProcessType.Redesign]: 'Redesign',
    [ProcessType.Turning]: 'Turning',
    [ProcessType.Grinding]: 'Grinding'
};

export const ProcessTypeDescriptions: Record<ProcessType, string> = {
    [ProcessType.Cleaning]: 'Remove dirt, oil, and contaminants from motor components',
    [ProcessType.Disassembly]: 'Take motor completely apart into individual components',
    [ProcessType.PartSubstitution]: 'Replace worn or damaged parts with new/refurbished components',
    [ProcessType.Reassembly]: 'Reassemble motor components back together',
    [ProcessType.Certification]: 'Test motor for efficiency compliance and quality standards',
    [ProcessType.Redesign]: 'Engineer improved components for motor upgrade',
    [ProcessType.Turning]: 'Machine parts on lathe for precision dimensions',
    [ProcessType.Grinding]: 'Precision surface finishing and grinding'
};
