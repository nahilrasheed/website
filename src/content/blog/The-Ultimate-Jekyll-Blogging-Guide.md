---
title: The Ultimate Jekyll Blogging Guide
publishDate: 2024-07-17
tags:
  - website
  - html
  - SSG
  - markdown
  - jekyll
  - chirpy
description: A Guide on how to setup a static blogging or portfolio site using jekyll.
---
## The Core Components
### Jekyll
[Jekyll](https://jekyllrb.com/) is a static site generator that transforms plain text into static websites and blogs. It's written in ruby and is fast, easy, and open source.
### Chirpy 
[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) is a minimal, responsive, and feature-rich Jekyll theme for technical writing.
It has built-in support for light/dark mode, search, SEO and so much more!.
### Github pages
[GitHub Pages](https://pages.github.com/) is a free web hosting service provided by GitHub. It allows users to host static websites directly from their GitHub repositories.

## Setup Jekyll

Install ruby and other prerequisites.
```bash
sudo apt update
sudo apt install ruby-full build-essential zlib1g-dev git
```

To avoid installing RubyGems packages as the root user:
```bash
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Install *Jekyll* and *Bundler*
```bash
gem install jekyll bundler
```

Confirm installation by using `jekyll -v`

Checkout jekyll installation docs [here](https://jekyllrb.com/docs/installation/).

## Use Chirpy
To create a site using the Chirpy Starter.
- Sign in to github and go to the [Chirpy Starter page](https://github.com/cotes2020/chirpy-starter). 
- Click the button `Use this template` -> `Create a new repository`, and name the new repository `USERNAME.github.io`
- Clone the repo to your local machine using `git clone repo-url`.
- Install dependencies
	```bash
	cd repo-name
	bundle
	```

Checkout Chirpy docs [here](https://chirpy.cotes.page/posts/getting-started/).

## Build site
To preview the site content by running a local server
```bash
bundle exec jekyll s
```
After a few seconds, the local service will be published at _[http://127.0.0.1:4000](http://127.0.0.1:4000/)_

To build your site in production mode
```bash
JEKYLL_ENV=production bundle exec jekyll b
```
This will output the production site to `_site`. You can upload this to a server to deploy your site manually.

## Deploy site
This site is already configured to automatically deploy to Github pages using [Github actions](https://docs.github.com/en/actions).

1. Go to your repository on GitHub. Select the _Settings_ tab, then click _Pages_ in the left navigation bar. In the **Source** section (under _Build and deployment_), select *GitHub Actions* from the dropdown menu.
2. Now all you have to do is push the changes to Github.
```bash
git add .
git commit -m "made some changes"
git push
```

In the _Actions_ tab of your repository, you should see the workflow _Build and Deploy_ running. Once the build is complete and successful, the site will be deployed automatically. 

You can now visit the URL provided by GitHub to access your site. (Which is usually USERNAME.github.io)
- If you’re on the GitHub Free plan, keep your site repository public.

## Usage
### Configure your Profile
Update the variables in `_config.yml` as needed. 
Make sure to set the following variables correctly:
- `title`
- `url` 
- `avatar`
- `timezone`
- `lang`
- `usernames`

Social contact options are displayed at the bottom of the sidebar. You can enable or disable specific contacts in the `_data/contact.yml` file.

### Creating a post
You can write posts using the markdown format. All posts are stored in the `_posts` folder.
Jekyll uses a naming [convention for pages and posts](https://jekyllrb.com/docs/posts/). 

To create a post, add a file to your `_posts` directory with the following format: `YYYY-MM-DD-title.md`.

All blog post files must begin with [Front Matter](https://jekyllrb.com/docs/front-matter/) which is typically used to set a [layout](https://jekyllrb.com/docs/layouts/) or other meta data. 

Recommended Front Matter for Chirpy 
```markdown
---
title: TITLE
date: YYYY-MM-DD HH:MM:SS +/-TTTT
categories: [TOP_CATEGORIE, SUB_CATEGORIE]
tags: [TAG]     # TAG names should always be lowercase
description: Short summary of the post.
---
```

### Local Linking of Files
- <https://jekyllrb.com/docs/posts/#including-images-and-resources>
Image from asset:
```markdown
... which is shown in the screenshot below:
![[/assets/screenshot.webp|A screenshot]]

You can also specify dimensions
![[/assets/img/sample/mockup.png|Desktop View]]{: w="700" h="400" }
```

Linking to a file
```markdown
... you can [[/assets/diagram.pdf|download the PDF]] here.
```

For additional information, checkout:
- <https://chirpy.cotes.page/posts/write-a-new-post/>
- <https://chirpy.cotes.page/posts/text-and-typography/>
- <https://chirpy.cotes.page/posts/customize-the-favicon/>

If you need some help with markdown, check out the [markdown cheat sheet](https://www.markdownguide.org/cheat-sheet/).

---

## Troubleshooting

If auto regeneration is not working, try
```bash
jekyll serve --force_polling
```

If `bundle` command is not working
1. Try updating your gems using `gem update`.

If `bundle exec jekyll s` is not working
1. Check output and see if any particular gem is giving problems.
2. try `bundle exec jekyll build`
3. or try `bundle exec jekyll serve --no-watch`
- As a workaround, you could use two terminal windows: one running `bundle exec jekyll build --watch` to rebuild your site when files change, and another running a simple HTTP server to serve your _site directory: `cd _site python -m http.server 4000``
	This last option would allow you to work on your site with live reloading, even if the Jekyll server itself isn't working.
	
If a specific gem is giving trouble, 
1. Reinstall that gem
	```shell
	gem uninstall ffi
	gem install ffi
	```
2. If that doesn't work, try reinstalling all your gems:
	```shell
	bundle clean --force
	bundle install
	```
3. Make sure you are using the correct version and platform of the gem.
	1. Check `ruby -v` and `gem list [gem-name]` or `gem info [gem-name`.
	2. If it's not same
		```shell
		gem uninstall ffi
		gem install ffi --platform=ruby
		```
	or install from local file: `gem install --local [pathtofile/gemname]`
	3. rebuild your bundle: `bundle install`

> Checkout <https://jekyllrb.com/docs/troubleshooting/>
{: .prompt-tip }

### Links
Other jekyll templates
- <https://github.com/mmistakes/minimal-mistakes>
- <https://github.com/maximevaillancourt/digital-garden-jekyll-template>
- <https://github.com/kitian616/jekyll-TeXt-theme>
- <https://github.com/alshedivat/al-folio>
- <https://github.com/jekyll/minima>
- <https://github.com/just-the-docs/just-the-docs>
- <https://github.com/sharu725/online-cv>