execute pathogen#infect()

filetype on
filetype plugin on
filetype indent on
syntax enable
let loaded_matchparen = 1
set noincsearch
set nohlsearch
set nowrapscan
set nobackup
set tabstop=4
set shiftwidth=4
set nowrap
set belloff=all

colors jellybeans

"allow project specific settings
set exrc
set secure

autocmd FileType javascript set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType typescript set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType json set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType html set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType python set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType sql set tabstop=2 | set shiftwidth=2 | set expandtab
autocmd FileType yml set tabstop=2 | set shiftwidth=2 | set expandtab


autocmd BufNewFile,BufRead *.json setlocal filetype=jsonc

set omnifunc=syntaxcomplete#Complete
