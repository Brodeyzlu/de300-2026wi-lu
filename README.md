### Homework 1 
Each task is separated by text tabs, and the EDA and actual functions for submission are separated. Only the functions need to be called. 

### Required Packages
pandas, missingno, miceforest, sklearn, numpy, matplotlib

### How to run code
User must first download T_F41SCHEDULE_B43.zip and read using pandas as a dataframe. This dataframe will be called inventory. 

The function for problem 1, impute_missing, takes a dataframe (inventory) as input and returns a dataframe (inventory_imputed) with imputed values as output. 
```
inventory_imputed = impute_missing(inventory)
# optionally
inventory_imputed.info()
```

The function for problem 2, transform_data, takes a dataframe (inventory_imputed) and returns a dataframe (cleaned_inventory) with several transformations applied to clean the data. 
```
cleaned_inventory = transform_data(inventory_imputed)
```

The function for problem 3, remove_missing_rows, takes a dataframe (cleaned_inventory) and returns a dataframe (cleaned_inventory_t) with rows missing data dropped. It also returns remaining_rows and percent_remaining, float values for the amount and percentages of rows remaining.
```
cleaned_inventory_t, remaining_rows, percent_remaining = remove_missing_rows(cleaned_inventory)
```

The functions for problem 4, plot_original_histograms and boxcox_transform, take a dataframe (cleaned_inventory_t) as input. plot_original_histograms returns no output but plots the histograms. 
boxcox_transform returns a dataframe with transformed columns added and transformed values for seats and capacity. 
```
plot_original_histograms(cleaned_inventory_t)
```

```
lambda_seats, lambda_capacity, cleaned_inventory_t = boxcox_transform(cleaned_inventory_t)
```

The function for problem 5, analyze_by_size, takes a dataframe as input and returns a dataframe with size column appended. 
It also returns operating counts and proportions as well as aircraft status counts and proportions. 

```
cleaned_inventory_size, operating_counts, operating_props, aircraft_status_counts, aircraft_status_props = analyze_by_size(cleaned_inventory_t)
```
