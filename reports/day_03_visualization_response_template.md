# Day 3 Visualization Response Template

These are drafting scaffolds, not final answers. Replace bracketed prompts after reviewing the evidence.

## 1. Which chart type best answers the question?

I would begin by naming the exact comparison I need to make: [write the comparison]. I can then choose a grouped or faceted bar chart because it places survival rates for gender and class on a common scale. I should mention why another chart would be less direct and identify the labels, denominator, and scale I checked. My response should refer to the generated gender/class figure and explain one pattern I personally noticed without claiming that the chart proves causation.

**Evidence reference:** `reports/figures/survival_by_gender_class.png`

My own final wording:

To compare passenger survival rates across demographic groups, a grouped or faceted bar chart is the most effective choice. In this project, I used a bar chart with passenger class on the x-axis, survival rate on the y-axis, and gender represented by color. This layout displays survival rates across different subgroups on a single, shared scale, making direct comparisons straightforward. A pie chart or stacked bar chart would be less effective because they make it harder to compare the heights of individual categories. By looking at reports/figures/survival_by_gender_class.png, I observed that females in first class had the highest survival rate, while males in third class had the lowest. This chart highlights a strong association between demographics and survival, though it does not imply that class or gender directly caused a passenger's survival.

## 2. How does design choice affect interpretation?

I should explain how one concrete choice, such as a zero baseline, ordering, color, annotation, or the use of counts versus rates, changes what I notice first. I can compare [design choice A] with [design choice B] and state which one communicates the class question more honestly. I should also record whether the chart remains readable on a small screen and whether its legend uses consistent outcome labels. My conclusion should connect clarity with responsible interpretation rather than treating visual styling as decoration.

**Evidence reference:** `reports/figures/survival_by_class.png`; `reports/interactive/survival_gender_class.html`

My own final wording:

Design choices like color and scale determine what the viewer notices first. In the interactive grouped chart reports/interactive/survival_gender_class.html, using rate instead of raw counts ensures the visual comparison remains fair, as there were many more third-class passengers overall. Starting the survival rate axis at zero prevents the visual differences between classes from being exaggerated. I chose consistent, muted colors—blue for deceased and green for survived—to make the chart easy to read. This is much clearer than using high-contrast colors, which can distract the viewer. Keeping the legend consistent and readable on mobile screens ensures the chart communicates clearly without distorting the data, helping viewers focus on the actual patterns in the historical record.

## 3. Can you make the visualization more engaging without losing clarity?

I can describe one useful interaction, such as hover counts, percentages, filtering, or drilling from outcome to gender and class. I should explain what the interaction helps me discover and what information remains visible without hovering. To keep the chart clear, I would limit the palette, use readable category names, and include a short statement of the question answered. I can compare the static plot with the sunburst or grouped interactive view, then write which version I would present first to the professor and why.

**Evidence reference:** `reports/interactive/titanic_sunburst.html`; `reports/figures/survival_by_gender_class.png`

My own final wording:

We can make visualizations more engaging by adding interactive features like hover tooltips and dynamic filters. In reports/interactive/titanic_sunburst.html, the viewer can click on segments to drill down from class to gender and survival status, which helps reveal specific patterns. Hovering displays the exact passenger counts and percentages, keeping the main chart clean. The static chart reports/figures/survival_by_gender_class.png is better for a quick summary, but the interactive sunburst is more engaging for presentations because it lets the audience explore the data. For my classroom presentation, I would start with the static chart to establish the main points and then use the interactive view to answer specific questions from the professor.

## 4. Question 1: If you had to visualize the Titanic dataset, which chart would best show survival by gender and class — and why?

I would identify a grouped or faceted bar chart as my starting point, then justify it using comparison rather than novelty. The response should say whether I am plotting passenger counts or within-group survival rates and why that denominator matters. I can note how facets separate gender while a shared axis keeps classes comparable. After viewing the generated chart, I should add one observation in my own words, mention that the pattern is observational, and link the exact evidence instead of relying on a memorized Titanic claim.

**Evidence reference:** `reports/figures/survival_by_gender_class.png`; `reports/tables/survival_counts.csv`

My own final wording:

A faceted or grouped bar chart is the best way to show survival by gender and class because it keeps the comparisons clear. I plotted survival rates rather than raw counts, which is important because the classes had different passenger totals. The y-axis shows the survival rate from 0.0 to 1.0, while the x-axis groups passengers by class and separates them by gender. Looking at reports/figures/survival_by_gender_class.png and reports/tables/survival_counts.csv, female survival was consistently higher than male survival across all classes. This visual arrangement shows a strong connection between these factors and survival, though we must remember these patterns are observational and do not prove direct causation.

## 5. Question 2: How can poor design choices — like misleading scales or excessive color — distort the message of a visualization?

I should give a specific example: truncating a bar axis can exaggerate a small difference, while too many colors can make categories appear meaningful when they are not. I can also mention inconsistent labels or duplicate raw codes because they split one group into several visual categories. My response should state how I checked the project plots for a zero baseline, readable labels, consistent outcome colors, and cleaned port/class values. I should finish with one design rule I plan to apply in my own future work.

**Evidence reference:** `reports/interactive/parallel_categories.html`; `scripts/generate_assignment_evidence.py`

My own final wording:

Poor design choices can easily distort a visualization's message. Truncating the y-axis of a bar chart can make small differences in survival look huge, while using too many bright colors can confuse the reader. Inconsistent category labels, like leaving raw embarkation codes like 'C' and 'S' uncleaned, splits passengers into separate visual groups. In reports/interactive/parallel_categories.html, I cleaned the passenger port and class categories so the flow remains readable and accurate. In my future work, I will apply a strict design rule: always start bar chart axes at zero, use consistent colors for outcomes, and clean categories before plotting. This ensures the visual representation remains truthful and easy to understand.
