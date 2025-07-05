import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '../../lib/utils';

// Types
interface StepperContextType {
  activeStep: number;
  completedSteps: Set<number>;
  orientation: 'horizontal' | 'vertical';
}

interface StepperProps {
  activeStep: number;
  completedSteps?: Set<number>;
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}

interface StepProps {
  children: ReactNode;
  className?: string;
  stepIndex?: number;
}

interface StepLabelProps {
  children: ReactNode;
  stepIndex: number; // This prop is correctly passed from the parent
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
}

// Context
const StepperContext = createContext<StepperContextType | undefined>(undefined);

const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
};

// Components
export const Stepper: React.FC<StepperProps> = ({
  activeStep,
  completedSteps = new Set<number>(),
  orientation = 'horizontal',
  children,
  className,
}) => {
  const contextValue: StepperContextType = {
    activeStep,
    completedSteps,
    orientation,
  };

  return React.createElement(
    StepperContext.Provider,
    { value: contextValue },
    React.createElement(
      'div',
      {
        className: cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        ),
      },
      React.Children.map(children, (child: React.ReactNode, index: number) => {
        if (React.isValidElement(child) && child.type === Step) {
          return React.cloneElement(child, {
            ...child.props,
            stepIndex: index, // Pass the correct stepIndex to each Step
          });
        }
        return child;
      })
    )
  );
};

export const Step: React.FC<StepProps> = ({
  children,
  stepIndex = 0,
  className,
}) => {
  const { orientation } = useStepperContext();

  return React.createElement(
    'div',
    {
      className: cn(
        'flex',
        orientation === 'horizontal' ? 'flex-col items-center' : 'flex-row items-start',
        className
      ),
    },
         React.Children.map(children, (child: React.ReactNode) => {
       if (React.isValidElement(child) && child.type === StepLabel) {
         // Pass the correct stepIndex to StepLabel
         return React.cloneElement(child, {
           ...child.props,
           stepIndex,
         });
       }
       return child;
     })
  );
};

export const StepLabel: React.FC<StepLabelProps> = ({
  children,
  stepIndex, // Use the stepIndex prop from parent instead of local ref
  isActive: propIsActive,
  isCompleted: propIsCompleted,
  className,
}) => {
  const { activeStep, completedSteps } = useStepperContext();

  // FIXED: Use the stepIndex prop passed from parent instead of local useRef
  // Previously buggy implementation would have looked like:
  // const stepIndexRef = useRef(0);
  // useEffect(() => {
  //   stepIndexRef.current = stepIndexRef.current + 1;
  // }, []);
  // const currentStepIndex = stepIndexRef.current;

  // Correct implementation: Use the stepIndex prop from parent
  const isActive = propIsActive ?? activeStep === stepIndex;
  const isCompleted = propIsCompleted ?? completedSteps.has(stepIndex);

  return React.createElement(
    'div',
    {
      className: cn(
        'flex items-center gap-2 rounded-lg p-2 transition-colors',
        isActive && 'bg-blue-50 text-blue-600',
        isCompleted && 'bg-green-50 text-green-600',
        !isActive && !isCompleted && 'text-gray-500',
        className
      ),
    },
    // Step number indicator
    React.createElement(
      'div',
      {
        className: cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
          isActive && 'border-blue-500 bg-blue-500 text-white',
          isCompleted && 'border-green-500 bg-green-500 text-white',
          !isActive && !isCompleted && 'border-gray-300 bg-white text-gray-500'
        ),
      },
      isCompleted ? '✓' : stepIndex + 1
    ),
    // Step content
    React.createElement('div', { className: 'flex-1' }, children)
  );
};

