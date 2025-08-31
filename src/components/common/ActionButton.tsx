import { ComponentType, ButtonHTMLAttributes } from "react";

type IconType = ComponentType<{ className?: string }>;

// 중앙관리 디자인 토큰: 색상/테두리/라운드/여백 등
const ACTION_BUTTON_TOKENS = {
  radius: {
    sm: "rounded",
    md: "rounded-lg",
  },
  spacing: {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
  },
  font: {
    sm: "text-sm",
    md: "text-sm",
  },
  variants: {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 border border-transparent dark:bg-primary-500 dark:hover:bg-primary-600",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
    danger:
      "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  },
  spinner: {
    base: "inline-block animate-spin border-2 border-current border-t-transparent rounded-full",
    size: {
      sm: "w-3 h-3",
      md: "w-4 h-4",
    },
  },
  icon: {
    size: "w-4 h-4",
    gap: "mr-2",
  },
} as const;

export interface ActionButtonStyleOverrides {
  radiusClass?: string;
  spacingClass?: string;
  fontClass?: string;
  variantClass?: string;
  spinnerSizeClass?: string;
  spinnerBaseClass?: string;
  iconSizeClass?: string;
  iconGapClass?: string;
}

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconType;
  text?: string;
  variant?: "primary" | "outline" | "danger";
  size?: "sm" | "md";
  iconOnly?: boolean;
  loading?: boolean;
  styles?: ActionButtonStyleOverrides; // 토큰 오버라이드
}

const resolveSizeClasses = (
  size: NonNullable<ActionButtonProps["size"]>,
  overrides?: ActionButtonStyleOverrides
) => {
  const spacing = overrides?.spacingClass ?? ACTION_BUTTON_TOKENS.spacing[size];
  const font = overrides?.fontClass ?? ACTION_BUTTON_TOKENS.font[size];
  const radius = overrides?.radiusClass ?? ACTION_BUTTON_TOKENS.radius[size];
  return `${spacing} ${font} ${radius}`;
};

export default function ActionButton({
  icon: Icon,
  text,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  loading = false,
  className = "",
  styles,
  ...props
}: ActionButtonProps) {
  const variantClass =
    styles?.variantClass ?? ACTION_BUTTON_TOKENS.variants[variant];
  const sizeClass = resolveSizeClasses(size, styles);
  const spinnerSizeClass =
    styles?.spinnerSizeClass ?? ACTION_BUTTON_TOKENS.spinner.size[size];
  const spinnerBaseClass =
    styles?.spinnerBaseClass ?? ACTION_BUTTON_TOKENS.spinner.base;
  const iconSizeClass = styles?.iconSizeClass ?? ACTION_BUTTON_TOKENS.icon.size;
  const iconGapClass = styles?.iconGapClass ?? ACTION_BUTTON_TOKENS.icon.gap;

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${sizeClass} ${variantClass} inline-flex items-center justify-center ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      {loading ? (
        <span className={`${spinnerBaseClass} ${spinnerSizeClass}`} />
      ) : (
        Icon && (
          <Icon
            className={`${iconSizeClass} ${iconOnly ? "" : iconGapClass} block`}
          />
        )
      )}
      {!iconOnly && (loading ? "" : text)}
    </button>
  );
}
