import './MaterialIcon.css';
import { useEffect, useState, type ReactElement } from "react";

interface MaterialIconProps {
    icon?: string;
    size?: 'S' | 'M' | 'L' | 'XL';
    className?: string;
    loader?: boolean;
}

const MaterialIcon = ({ icon = 'emoticon', size = 'M', className, loader }: MaterialIconProps): ReactElement => {
    const classes = ['material-symbols-outlined'];
    const sizeMap = {
        'S': 'small',
        'M': 'medium',
        'L': 'large',
        'XL': 'extra-large'
    };
    
    if (className) classes.push(className);
    classes.push(sizeMap[size]);

    const [appliedClasses, setAppliedClasses] = useState(classes);
    
    useEffect(() => {
        setAppliedClasses(
            loader ? [...classes, 'loader'] : classes
        );
    }, [loader]);

    return <span className={appliedClasses.join(' ')}>{loader ? 'progress_activity' : icon}</span>;
};

export default MaterialIcon;