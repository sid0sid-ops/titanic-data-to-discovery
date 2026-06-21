"""Shared visual styling."""

SURVIVAL_PALETTE = {"Died": "#c2415d", "Survived": "#137f8b"}


def save_figure(figure, path) -> None:
    figure.tight_layout()
    figure.savefig(path, dpi=160, bbox_inches="tight", facecolor="white")
