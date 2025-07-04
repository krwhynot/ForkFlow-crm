export const RoundButton = ({ color, handleClick, selected }: any) => (
    <button
        type="button"
        className={`w-8 h-8 rounded-full inline-block m-1 ${
            selected ? 'border-2 border-gray-500' : 'border-none'
        }`}
        style={{ backgroundColor: color }}
        onClick={handleClick}
    />
);
