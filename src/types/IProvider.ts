import { IProcessCapability } from './IProcessCapability';
import { ITechnicalCapabilities } from './ITechnicalCapabilities';

export interface IProvider {
    id: string;
    type: string;
    name: string;
    enabled: boolean;
    processCapabilities: IProcessCapability[];
    technicalCapabilities: ITechnicalCapabilities;
}
