import { useEffect, useState } from 'react';
import deleteGif from '../../../../_theme/assets/gifs/trash-bin.gif';

type DeleteProps = {
    message?: string;          
    confirmText?: string;      // only used in github mode
    mode?: "simple" | "github"; 
    close: () => void;
    delete: () => void;
    isDeleting: boolean;
};

function Delete({
    message,
    confirmText = "delete this",
    mode = "simple",
    close,
    delete: deleteFun,
    isDeleting,
}: DeleteProps) {
    const [initiated, setInitiated] = useState(false);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (!initiated) {
            setInitiated(isDeleting);
        }
    }, [isDeleting]);

    // Check if input matches confirmText (only in github mode)
    const isMatch = mode === "github"
        ? inputValue.trim().toLowerCase() === confirmText.toLowerCase()
        : true;

    return (
        <div className="flex justify-center flex-col items-center space-y-4 mt-5">
            <img src={deleteGif} alt="delete" className="w-12 h-12" />

            {/* Dynamic message */}
            <p className="text-center text-sm text-gray-700">
                {mode === "github"
                    ? message ?? `Please type "${confirmText}" to permanently delete.`
                    : message ?? "Are you sure you want to delete?"}
            </p>

            {/* GitHub-style confirmation input */}
            {mode === "github" && (
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Type "${confirmText}"`}
                    className="border rounded-lg px-3 py-2 w-64 text-center"
                />
            )}

            {/* Buttons */}
            <div className="flex gap-4">
                <button
                    className="btn bg-BG border-BG shadow-none rounded-lg"
                    onClick={close}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={!isMatch || initiated}
                    className={`btn btn-danger ${(!isMatch || initiated) && "opacity-50 cursor-not-allowed"}`}
                    onClick={deleteFun}
                >
                    {initiated ? (
                        <>
                            <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                            Loading
                        </>
                    ) : (
                        "Delete"
                    )}
                </button>
            </div>
        </div>
    );
}

export default Delete;
