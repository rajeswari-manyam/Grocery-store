import { cn } from '../../utils/cn';
import { isEmojiImage, getProductImageSrc } from '../../services/api';

interface ProductImageProps {
  image: string;
  name: string;
  className?: string;
  textSize?: string;
}

export default function ProductImage({ image, name, className, textSize = 'text-6xl' }: ProductImageProps) {
  if (isEmojiImage(image)) {
    return <span className={cn(textSize, className)}>{image || '🌾'}</span>;
  }

  return (
    <img
      src={getProductImageSrc(image)}
      alt={name}
      className={cn('w-full h-full object-cover', className)}
      loading="lazy"
      onError={e => {
        const target = e.currentTarget;
        target.style.display = 'none';
        if (target.parentElement) {
          const emoji = document.createElement('span');
          emoji.className = textSize;
          emoji.textContent = '🌾';
          target.parentElement.appendChild(emoji);
        }
      }}
    />
  );
}
