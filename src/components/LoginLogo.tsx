import React from "react";
import Image from "next/image";

export const LoginLogo = () => {
	return (
		<div className='relative'>
			<Image
				src='/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png'
				alt='DHQ Logo'
				width={80}
				height={80}
				className='w-20 h-20 mx-auto'
			/>
		</div>
	);
};
