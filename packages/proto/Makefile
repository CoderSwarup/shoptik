# Proto Generation Makefile
# Usage: make proto-go, make proto-node, or make proto-all

PROTO_DIR := packages/proto
GO_OUT_DIR := apps/go-service/pkg/proto/shoptik
NODE_OUT_DIR := apps/nestjs-service/src/proto

.PHONY: proto-go proto-node proto-all clean

# Generate Go protobuf files
proto-go:
	@echo "Generating Go protobuf files..."
	@mkdir -p $(GO_OUT_DIR)
	protoc --proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT_DIR) \
		--go_opt=paths=source_relative \
		--go-grpc_out=$(GO_OUT_DIR) \
		--go-grpc_opt=paths=source_relative \
		$(PROTO_DIR)/*.proto
	@echo "Go protobuf files generated in $(GO_OUT_DIR)"

# Generate Node.js/NestJS protobuf files
proto-node:
	@echo "Generating Node.js protobuf files..."
	@mkdir -p $(NODE_OUT_DIR)
	protoc --proto_path=$(PROTO_DIR) \
		--js_out=import_style=commonjs,binary:$(NODE_OUT_DIR) \
		--grpc-web_out=import_style=commonjs,mode=grpcjs:$(NODE_OUT_DIR) \
		$(PROTO_DIR)/*.proto
	@echo "Node.js protobuf files generated in $(NODE_OUT_DIR)"

# Generate all protobuf files
proto-all: proto-go proto-node
	@echo "All protobuf files generated successfully!"

# Clean generated files
clean:
	@echo "Cleaning generated protobuf files..."
	rm -rf $(GO_OUT_DIR)/*.pb.go
	rm -rf $(NODE_OUT_DIR)/*.js
	rm -rf $(NODE_OUT_DIR)/*.d.ts
	@echo "Generated files cleaned!"
