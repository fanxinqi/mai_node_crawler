# /Users/fred/.nvm/versions/node/v12.8.0/bin/pm2

# re-create env:
# nvm install v18.13.0
# nvm alias default v18.13.0
# rm -rf node_modules/
# npm install

pm2 start node --name main -- index.js -i `hostname` -s 20000 -r 1 -n 100 -c 1
pm2 start node --name child1 -- index.js -i `hostname` -s 20000 -r 1 -n 100 -c 0
pm2 start node --name child2 -- index.js -i `hostname` -s 20000 -r 1 -n 100 -c 0
pm2 start node --name child3 -- index.js -i `hostname` -s 20000 -r 1 -n 100 -c 0

# kp task
pm2 start node --name chat-flow -- ./chat-flow.js

# b serch 先启动心跳进程
# b serch task heartbeat watch
pm2 start ./scripts/process_heartbeat_watch_dog.js --name b_flow_watch_dog
# b serch task heartbeat watch log
tail -f /Users/fred/.pm2/logs/b-flow-watch-dog-out.log

# b serch task
pm2 start ./b_flow.js --name b_flow
tail -f /Users/fred/.pm2/logs/b-flow-out.log 
