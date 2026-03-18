import React from 'react';

function SelectFileUi({ name }: { name?: string | null }) {
    return (
        <div className="flex flex-col rounded-md items-center border-[1.5px] border-dashed border-gray-400 cursor-pointer gap-4 py-5 ">
            <svg className="" width="46" height="47" viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="icon-arrow-up-on-square-outline">
                    <path
                        id="Vector (Stroke)"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21.9835 3.79603C22.5449 3.23466 23.4551 3.23466 24.0165 3.79603L29.7665 9.54604C30.3278 10.1074 30.3278 11.0176 29.7665 11.579C29.2051 12.1403 28.2949 12.1403 27.7335 11.579L24.4375 8.28293L24.4375 29.25C24.4375 30.0439 23.7939 30.6875 23 30.6875C22.2061 30.6875 21.5625 30.0439 21.5625 29.25L21.5625 8.28293L18.2665 11.579C17.7051 12.1403 16.7949 12.1403 16.2335 11.579C15.6722 11.0176 15.6722 10.1074 16.2335 9.54603L21.9835 3.79603ZM14.375 17.75C12.7872 17.75 11.5 19.0372 11.5 20.625V37.875C11.5 39.4628 12.7872 40.75 14.375 40.75H31.625C33.2128 40.75 34.5 39.4628 34.5 37.875V20.625C34.5 19.0372 33.2128 17.75 31.625 17.75H28.75C27.9561 17.75 27.3125 17.1064 27.3125 16.3125C27.3125 15.5186 27.9561 14.875 28.75 14.875H31.625C34.8006 14.875 37.375 17.4494 37.375 20.625V37.875C37.375 41.0506 34.8006 43.625 31.625 43.625H14.375C11.1994 43.625 8.625 41.0506 8.625 37.875V20.625C8.625 17.4494 11.1994 14.875 14.375 14.875H17.25C18.0439 14.875 18.6875 15.5186 18.6875 16.3125C18.6875 17.1064 18.0439 17.75 17.25 17.75H14.375Z"
                        fill="#7F56D9"
                    />
                </g>
            </svg>
            <p className="text-brand-400 font-semibold ml-2 text-xs">Drag and drop file here or click to upload</p>
            <div className="flex gap-3 text-xs">
                {name ? (
                    <p>
                        File name: <strong>{name}</strong>
                    </p>
                ) : (
                    <>
                        <p>
                            File size: <strong>40MB</strong>
                        </p>
                        <p>
                            File type: <strong>JPEG, PNG, JPG</strong>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default SelectFileUi;
