## How to deploy `novlr` to Azure

#### Branches

Separate branch exists for Azure deployment called
`azure-prod`.  This branch has slightly relaxed `.gitignore`
rules (includes build output), this allows to build locally and deploy
to azure, and not worry about missing `bower` components. `npm` dependancies
however are automatically managed by Azure, therefore there was no need
to include `node_modules` to `.gitignore`

#### Remotes

A separate [remote](http://gitref.org/remotes/) needs to exist to push changes to Azure,
it should be called `azure`.

to add this remote to your local git repository run

```
  $ git remote add azure https://novlr-prod@novlr-prod.scm.azurewebsites.net:443/novlr-prod.git
```


#### Deployment process

Depoloyment process is slightly more complex than one of `nodejitsu`, but at
the same time being multi-step it allows to fully comprehend as to what's being deployed
thus preventing from untested changes going live.

  1. (optional) merge all pull requests from other branches to `master`.
  2. build `master` and make sure you are happy with it
  3. switch to `azure-prod` and merge `master`

    ```
        $ git checkout azure-prod
        $ git merge master
    ```

  4. build `azure-prod` and make sure you're happy with it
    ```
        $ grunt build
        $ node index.js
    ```

  5. commit changes to `azure-prod`
    ```
        $ git commit -am "merging release XXX..."
    ```

  6. push changes to github, just to keep it in sync
    ```
        $ git push origin azure-prod
    ```
  7. push changes to azure
    ```
        $ git push azure azure-prod:master
    ```

    7.1 this will ask you for credentials, login: `novlr-prod`, password: `Hadoop46`

    7.2 this last line means - push changes to `azure` remote,
        from local branch `azure-prod`, to remote branch `master`

#### ![excl](http://png-4.findicons.com/files/icons/42/basic/32/warning.png) IMPORTANT!!

It is important how branches and merging is managed, to avoid conflicts on `master`
and/or `azure-prod` branches.

Merging flow should always be from `feature/bugfix` branches to `master` to `azure-prod`,
never in opposite direction. This is because `azure-prod` `.gitignore` rules are more relaxed
and build artifacts may leak back to `master`.

 * No dev changes to be made to `azure-prod` under any circumstances.
 * No changes to be made directly to `master` unless approved by `@Kim` - changes go to `master` via pull request only

##### merge flow diagram:

```
  * feature_branch_1 \
  * feature_branch_2 --> * master --> azure-prod
  * bugfix_branch_1 /
```