export const Modal = ({isOpen, isClose, children}: {
    isOpen: boolean;
    isClose: () => void;
    children: React.ReactNode;
}) => {
    if(!isOpen) return null

    return (
        <div className="modal-overplay" onClick={isClose}>
            <div className="modal-content" onClick={(e) => { e.stopPropagation()}}>
                <button className="modal-close" onClick={isClose}>X</button>
                {children}
            </div>
        </div>
    )
}