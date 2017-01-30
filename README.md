#Stock-Overflow

#Introduction

According to a recent article published by CNBC, the median savings for adult Americans is less than $5,000. According to that same article, 'in 2013, nearly nine in 10 families in the top income fifth had retirement account savings, compared with fewer than one in 10 families in the bottom income fifth'. 

These staggering statistics outline a major disparity, which is largely brought about by a lack of education, particularly in financial literacy, and a lack of comfort and motivation by most Americans in taking an active role in their financial security. 

This application was created as a tool for beginners, and allows them to view several aspects of a company's financial health, and make investment decisions based upon that data. Stock Overflow is largely meant as an educational platform, and will be built upon significantly in the future.

#Use Cases

The primary use case for this application is that of the interested but under-informed individual. This person signs up for an account, and is given a large sum of fake money to invest with. Upon visiting the "builder" page, a user can search for a company of interest, and is returned an array of financial data, with explanations as to what each figure means:

1. Stock price peformance
 +an overview of the company's price performance for the last 5 years, displayed in a large chart

2. Financial ratios
  1. Price-earnings ratio
  2. Debt-to-equity ratio
  3. Return on equity
  4. Return on assets
  5. Current ratio
  6. Asset turnover ratio
 
3. News
  1. a listing and summary of recent news stories related to the company.
 
After reviewing this information, a user can make a decision regarding the purchase of the stock.

After purchasing a stock(s), the profile page gives users a graphical overview of their portfolio based upon various parameters, and the user can choose to sell, hold, or purchase more of a given stock.


#Technical Overview

###Stack/technology used in this project:

1. MongoDB
  * Used to store user information, stock positions, company information, and transaction information
  * Uses basic queries and updates to store and handle information
2. Node/Express
  * Used for the primary server, largely for handling communication with database and user authentication
3. Passport
  * Library used for user authentication
4. HTML/CSS/jQuery
  * Used for page structure and styling and updates to the DOM
5. Chart.js
  * Library used for all charting throughout the application
6. Intrinio API
  * Used to gather all financial information
7. EJS Templates
  * Used primarily for the management of the registration and and login pages


#RoadMap

This application is currently in v1. Below is a summary of changes to be implemented moving forward:

###v2

Version 2 will contain a large overhaul of the underlying technology, performance, and architecture, but will keep most features. The summary of changes to be made are outlined below:

* Instead of using Intrinio API for pricing data, I will consume excel files from resources used in other projects to keep a more up-to-date pricing database (updated every 5 minutes). This will cut back considerably on API calls used
* Store pricing information in MongoDB, to avoid calling external API for every user request.
* Implement a front-end view/controller framework to manage DOM updates, and do away with jQuery
* Overhaul the routing section of server files for more efficient use of database interactions
* Add a "library" section with tailored reading materials for beginners

###v3

Version 3 will aim towards adding important educational features and functionality, in an effort to make the application more of a legimiate and applicable learning tool:

* Use D3.js to add financial charting, and implement high-level, highly prevalent financial charts for each user's portfolio or prospective stock choices
* Add a new website section for technical analysis, which teaches users the basics of charting, what to look for, how to analyze a stock, and prominent methodologies for doing so
* Add a "news-feed" section, and allow users to track and follow updates to specific "friends", as well as updates to stocks in their portfolio

###v4

Version 4 features and functionality will be a major and intensive step towards making the application an inclusive classroom type environment, with significant thought and effort in educational materials and overall updates to the UI and UX.

This portion of the RoadMap will be expanded upon once earlier versions are completed and the project takes a more pronounced form.
