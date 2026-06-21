"""Statistical evidence helpers."""

from math import sqrt

from scipy.stats import fisher_exact, norm


def gender_survival_test(frame) -> dict[str, float | int | str]:
    """Test the directional question: is female survival higher than male survival?"""
    female = frame.loc[frame["sex"] == "female", "survived"].dropna().astype(int)
    male = frame.loc[frame["sex"] == "male", "survived"].dropna().astype(int)
    female_survivors = int(female.sum())
    male_survivors = int(male.sum())
    female_total = int(female.size)
    male_total = int(male.size)
    table = [
        [female_survivors, female_total - female_survivors],
        [male_survivors, male_total - male_survivors],
    ]
    odds_ratio, p_value = fisher_exact(table, alternative="greater")
    female_rate = female_survivors / female_total
    male_rate = male_survivors / male_total
    rate_difference = female_rate - male_rate

    # A transparent Wald interval is included as a descriptive effect-size interval.
    standard_error = sqrt(
        female_rate * (1 - female_rate) / female_total
        + male_rate * (1 - male_rate) / male_total
    )
    margin = norm.ppf(0.975) * standard_error
    return {
        "test_name": "Fisher exact test (one-sided)",
        "alternative_hypothesis": "female survival rate > male survival rate",
        "female_survivors": female_survivors,
        "female_total": female_total,
        "male_survivors": male_survivors,
        "male_total": male_total,
        "female_survival_rate": female_rate,
        "male_survival_rate": male_rate,
        "rate_difference": rate_difference,
        "rate_difference_ci_95_low": rate_difference - margin,
        "rate_difference_ci_95_high": rate_difference + margin,
        "odds_ratio": float(odds_ratio),
        "p_value": float(p_value),
        "alpha": 0.05,
    }
