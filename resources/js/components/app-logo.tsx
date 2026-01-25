import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ className = '' }: { className?: string }) {
    return (
        <AppLogoIcon className={`size-5 fill-current ${className}`} />
    );
}
