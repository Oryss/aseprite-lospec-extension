compile:
	docker-compose exec api ./node_modules/.bin/tsc

up:
	docker-compose up

up_background:
	docker-compose up -d

run: up_background
	docker-compose exec api npm run dev

retrieve: up_background
	docker-compose exec api npm run retrieve

migrate: up_background
	docker-compose exec db psql -d db_name -U postgres -f ./migrations/1.sql
