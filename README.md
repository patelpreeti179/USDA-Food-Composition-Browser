# USDA Food Composition Visual Browser

## Description
* The goal of this project is to make food data more accessible to the world and to help users answer the question **“What’s in my food?”** and to assist them in making healthy choices about what to eat. 
* The application will give the user a high-level understanding of the nutrient composition of the food as a whole, with the option to drill down to more detailed information if needed. 
* The visualization answers the following questions: 
 * What is the nutrient composition of a food X?
 * What foods contain a specific composition of nutrients? 
 * What are the alternative food options to a specific selection of food(x)? 
 * What are the top foods containing a combination of nutrients?
 * In a specific food group, Is nutrient X correlated to nutrient Y?

## Data Source
[USDA food composition](https://ndb.nal.usda.gov/ndb/search/list)

## Parallel coordinates
* It is the way of visualizing high-dimensional geometry and analyzing multivariate data.
* To show a set of points in an n-dimensional space, a backdrop is drawn consisting of n parallel lines, typically vertical and equally spaced, which represent each Nutrients. 
* A point in n-dimensional space is represented as a polyline with vertices on the parallel axes; the position of the vertex on the i-th axis corresponds to the i-th coordinate of the point, which give the amount (quantitative value) of the respective nutrient content. 
* To know more about D3 Parallel Coordinates, [check this out!] (https://bl.ocks.org/mbostock/1341021)


##  Sample Visual Browser: 
![Alt text](https://github.com/NYU-CS6313-Fall16/USDA-9/blob/master/Screenshot.png "Nutrient Visualization") 


## Features
1. Selectable food groups using check box. As and when the food groups are selected, the nutrient composition of added foods from newly added food groups are displayed using parallel coordinates.
2. A histogram of the number of foods from in each food group selected is shown next to the name of the food group.
3. A brush can be used to select the range in a nutrient. The foods are filtered dynamically based on range selection
4. Parallel coordinates can be repositioned to get an idea about their correlation with each other.
5. Ranges from multiple nutrients can be selected and foods are filtered dynamically.
6. Highlights nutrient composition of a single food item upon hovering over it. 
7. Search Box to search the food items.

## Links

* [Live Demo](https://nyu-cs6313-fall16.github.io/USDA-9/index.html)
* [Video Link] (https://vimeo.com/196914006) 
* [Project Report](https://docs.google.com/a/nyu.edu/document/d/1TMgx9vkE43MVaQPYrhZlWWjWv-eORle2dc09L0OyyZU/edit?usp=sharing)
# USDA-Food-Composition-Browser
